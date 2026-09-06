/**
 * @module controllers/report
 *
 * The §31 report surface — B2 ships the atomic create pipeline
 * (`POST /reports`) only. Other handlers land in their own increments
 * (B3 clips, B4 transcription, B5 read/edit/lifecycle, B6 items).
 *
 * Create flow (§31.2, R4, A1–A15):
 *   1. load/resume the `createKey` attempt-session (filesystem staging,
 *      `services/attemptSession.js` — no Mongo collection, §17.2).
 *   2. `clipIndexes` maps each multipart `clips[]` file to the original
 *      session clip index; clips NOT in this resubmit keep their state.
 *   3. each resubmitted clip: ffprobe-duration gate → STT (Addis Path A)
 *      → mark transcribed with its text.
 *   4. merge = per-index transcript in order; an empty merge rejects
 *      the whole create (all-silent).
 *   5. ONE §27.7 transaction creates the Report (visits + embedded
 *      audios, with `filePath` set to the final path + transcription
 *      {raw,latest,ready:true}); the attempt becomes `committed` with
 *      `committedReportId` (idempotent replay).
 *   6. after commit the staging files move to their final path.
 *      A committed resubmit of the same key returns the existing report.
 */

import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
import { rename, unlink } from "node:fs/promises";
import logger from "../utils/logger.js";
import { CustomError } from "../utils/errors.js";
import { HTTP_STATUS } from "../utils/httpStatus.js";
import { transcribeClip } from "../services/stt.service.js";
import { loadAttempt, saveAttempt, clearAttempt } from "../services/attemptSession.js";
import { getAudioDuration } from "../utils/ffprobe.js";
import Report from "../models/report.model.js";
import Branch from "../models/branch.model.js";
import {
  AUDIO_MAX_DURATION_SEC,
  UPLOADS_AUDIO_DIR,
} from "../utils/constants.js";

/**
 * Builds the final `filePath` for a clip of a report (unique + safe).
 * @param {string} reportId - The created report's `_id`.
 * @param {string} fileName - `index-originalname` clip name.
 * @returns {string} `uploads/audio/<reportId>-<name>`.
 */
const finalPathFor = (reportId, fileName) =>
  `${UPLOADS_AUDIO_DIR}/${reportId}-${fileName}`;

/**
 * POST /reports — atomic multipart create.
 * @type {import("express").RequestHandler}
 */
export const createReport = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { createKey, metadata, clipIndexes } = req.validated.body;
  /** @type {import("multer").Express.Multer.File[]} */
  const files = req.files ?? [];

  if (files.length !== clipIndexes.length) {
    throw new CustomError(
      "UNPROCESSABLE_ENTITY",
      "Clip files and indexes do not match",
    );
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const attempt = await loadAttempt(userId, createKey);

    // Idempotent replay (A1): a committed attempt returns the report.
    if (attempt.status === "committed" && attempt.committedReportId) {
      const existing = await Report.findById(attempt.committedReportId)
        .session(session)
        .lean();
      if (existing) {
        await session.commitTransaction();
        res.status(HTTP_STATUS.OK).json({
          success: true,
          message: "Report created",
          data: existing,
        });
        return;
      }
    }

    // Resolve every visited branch to an ACTIVE branch of this user.
    const branchIds = [...new Set(metadata.visits.map((v) => v.branch))];
    const activeBranches = await Branch.find({
      user: userId,
      isArchived: false,
      _id: { $in: branchIds },
    })
      .session(session)
      .lean();
    const activeSet = new Set(activeBranches.map((b) => b._id.toString()));
    const badVisit = metadata.visits.find(
      (v) => !activeSet.has(v.branch?.toString()),
    );
    if (badVisit) {
      throw new CustomError(
        "UNPROCESSABLE_ENTITY",
        "A visited branch is not available",
        [
          {
            field: `visits[${metadata.visits.indexOf(badVisit)}].branch`,
            message: "Invalid or unavailable branch",
          },
        ],
      );
    }

    // Duration gate (ffprobe) before any STT — validated once, retained
    // for the audios[] rows.
    const clipDurations = await Promise.all(
      files.map(async (file) => {
        const durationSec = (await getAudioDuration(file.path).catch(() => -1)) || -1;
        if (durationSec > AUDIO_MAX_DURATION_SEC || durationSec < 0) {
          throw new CustomError(
            "UNPROCESSABLE_ENTITY",
            "A clip is longer than the allowed duration",
          );
        }
        return durationSec;
      }),
    );

    // Rebuild the session clip list from files + indexes, keeping the
    // state of clips NOT resubmitted this round.
    const sessionClips = [...attempt.clips];
    for (let j = 0; j < files.length; j += 1) {
      const index = clipIndexes[j];
      if (Number.isNaN(index)) {
        throw new CustomError("UNPROCESSABLE_ENTITY", "Invalid clip index");
      }
      const existing = sessionClips.find((c) => c.index === index);
      let text = existing?.text ?? null;
      if (!existing?.transcribed) {
        text = await transcribeClip(files[j].path);
      }
      const cursor = sessionClips.findIndex((c) => c.index === index);
      const record = {
        index,
        name: files[j].originalname,
        uploaded: true,
        transcribed: true,
        text: text ?? "",
        error: null,
      };
      if (cursor >= 0) {
        sessionClips[cursor] = record;
      } else {
        sessionClips.push(record);
      }
    }

    // Merge in index order; an empty merge rejects the whole create (A15).
    sessionClips.sort((a, b) => a.index - b.index);
    const merged = sessionClips.map((c) => c.text ?? "").join(" ");
    if (merged.trim() === "") {
      throw new CustomError(
        "UNPROCESSABLE_ENTITY",
        "The recording came out silent — please re-record",
      );
    }

    // Create the Report in the session; audios[] carries the final path
    // (files are physically moved after commit).
    const report = await Report.create(
      [
        {
          user: userId,
          date: metadata.date ? new Date(metadata.date) : null,
          visits: metadata.visits.map((v) => ({
            branch: v.branch,
            clockIn: v.clockIn,
            clockOut: v.clockOut,
            isMain: v.isMain,
          })),
          transcription: { raw: merged, latest: merged, ready: true },
          generated: "",
        },
      ],
      { session },
    );
    const reportRow = report[0];
    reportRow.audios = files.map((file, j) => ({
      mimeType: file.mimetype,
      sizeBytes: file.size,
      durationSec: clipDurations[j],
      filePath: finalPathFor(
        reportRow._id.toString(),
        `${clipIndexes[j]}-${file.originalname}`,
      ),
      createdAt: new Date(),
    }));
    await reportRow.save({ session });

    attempt.status = "committed";
    attempt.committedReportId = reportRow._id.toString();
    attempt.clips = sessionClips;
    await saveAttempt(userId, createKey, attempt);

    await session.commitTransaction();

    // Move the staged files to their final path after commit — the
    // orphan sweep is the safety net on failure (§62).
    const finalMoves = files.map((file, j) =>
      rename(file.path, reportRow.audios[j].filePath).catch((error) => {
        logger.error(`stage-move-failed ${reportRow._id} ${file.filename}`);
      }),
    );
    await Promise.allSettled(finalMoves);

    // The attempt's own state file is no longer needed after commit;
    // the staged-now-final clip files have moved, so clear the dir.
    await clearAttempt(userId, createKey);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: "Report created",
      data: reportRow.toJSON(),
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
});

/**
 * Resolves a report (owner-scoped) or throws 404 (§31).
 * @param {import("express").Request} req - Express request (has params).
 * @returns {Promise<import("mongoose").Document>} Lean report row.
 */
const findOwnedReport = async (req) => {
  const userId = req.user._id;
  const { reportId } = req.validated.params;
  const report = await Report.findOne({ _id: reportId, user: userId }).lean();
  if (!report) {
    throw new CustomError("NOT_FOUND", "Report not found");
  }
  return report;
};

/**
 * Rejects writes on archived or generated reports (BR-12 §31.8) —
 * reads are allowed on both (review surfaces).
 * @param {Object} report - The owned report row (lean).
 */
const assertWritable = (report) => {
  if (report.isArchived) {
    throw new CustomError("FORBIDDEN", "Report is archived");
  }
  if (report.generated) {
    throw new CustomError("FORBIDDEN", "Report is already generated");
  }
};

/**
 * Serializes an embedded AudioClip subdoc to the AudioDto — `filePath`
 * never leaks; `updatedAt` aliases `createdAt` (clips are immutable).
 * @param {Object} audio - The embedded subdoc.
 * @param {string} reportId - The owning report `_id`.
 * @returns {Object} AudioDto.
 */
const toAudioDto = (audio, reportId) => ({
  _id: audio._id,
  report: reportId,
  mimeType: audio.mimeType,
  sizeBytes: audio.sizeBytes,
  durationSec: audio.durationSec,
  createdAt: audio.createdAt,
  updatedAt: audio.createdAt,
});

/**
 * POST /reports/:reportId/clips — add a clip at edit time (post-create).
 * @type {import("express").RequestHandler}
 */
export const addClip = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { reportId } = req.validated.params;
  const file = req.file;

  if (!file) {
    throw new CustomError("UNPROCESSABLE_ENTITY", "A clip file is required");
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const report = await Report.findOne({ _id: reportId, user: userId })
      .session(session);
    if (!report) {
      throw new CustomError("NOT_FOUND", "Report not found");
    }
    assertWritable(report);

    // Duration gate (ffprobe) — the file is already on disk (multer).
    const durationSec = (await getAudioDuration(file.path).catch(() => -1)) || -1;
    if (durationSec > AUDIO_MAX_DURATION_SEC || durationSec < 0) {
      throw new CustomError(
        "UNPROCESSABLE_ENTITY",
        "The clip is longer than the allowed duration",
      );
    }

    report.audios.push({
      mimeType: file.mimetype,
      sizeBytes: file.size,
      durationSec,
      filePath: file.path, // final path already chosen by multer
      createdAt: new Date(),
    });
    // R4 C1: adding a clip on a transcription-bearing report drops readiness.
    if (report.transcription) {
      report.transcription.ready = false;
    }
    await report.save({ session });
    await session.commitTransaction();

    const audio = report.audios[report.audios.length - 1];
    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: "Clip uploaded",
      data: toAudioDto(audio, reportId),
    });
  } catch (error) {
    await session.abortTransaction();
    // unlink the just-uploaded file on failure (orphan sweep also guards).
    if (file?.path) {
      await unlink(file.path).catch(() => {});
    }
    throw error;
  } finally {
    await session.endSession();
  }
});

/**
 * GET /reports/:reportId/clips — flat list, createdAt asc.
 * @type {import("express").RequestHandler}
 */
export const listClips = asyncHandler(async (req, res) => {
  const { reportId } = req.validated.params;
  const report = await findOwnedReport(req);
  const clips = [...report.audios].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
  );
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Clips",
    data: { clips: clips.map((a) => toAudioDto(a, reportId)) },
  });
});

/**
 * GET /reports/:reportId/clips/:clipId — single AudioDto (byte source
 * for a client-side playback Blob — no stream endpoint).
 * @type {import("express").RequestHandler}
 */
export const getClip = asyncHandler(async (req, res) => {
  const { reportId, clipId } = req.validated.params;
  const report = await findOwnedReport(req);
  const audio = report.audios.find((a) => a._id.toString() === clipId);
  if (!audio) {
    throw new CustomError("NOT_FOUND", "Clip not found");
  }
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Clip",
    data: toAudioDto(audio, reportId),
  });
});

/**
 * DELETE /reports/:reportId/clips/:clipId — direct delete: embedded
 * subdoc removed + physical `fs.unlink` (R4 C2/C3: readiness drops, or
 * the transcription clears when the last clip is removed).
 * @type {import("express").RequestHandler}
 */
export const deleteClip = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { reportId, clipId } = req.validated.params;

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const report = await Report.findOne({ _id: reportId, user: userId })
      .session(session);
    if (!report) {
      throw new CustomError("NOT_FOUND", "Report not found");
    }
    assertWritable(report);

    const audio = report.audios.find((a) => a._id.toString() === clipId);
    if (!audio) {
      throw new CustomError("NOT_FOUND", "Clip not found");
    }
    const filePath = audio.filePath;

    report.audios = report.audios.filter((a) => a._id.toString() !== clipId);
    if (report.audios.length === 0) {
      // R4 C3 — last clip deleted: clear the transcription.
      report.transcription = { raw: null, latest: null, ready: false };
    } else if (report.transcription) {
      // R4 C2 — non-last delete: drop readiness, keep the transcription.
      report.transcription.ready = false;
    }
    await report.save({ session });
    await session.commitTransaction();

    // Unlink the physical file after commit (orphan sweep is the net).
    await unlink(filePath).catch(() => {});

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Clip deleted",
      data: null,
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
});

/**
 * Serializes the embedded transcription to its wire shape.
 * @param {Object|null} transcription - The report's transcription.
 * @returns {{raw: string|null, latest: string|null, readiness: boolean}}
 *   `raw`/`latest` null when cleared; readiness = the `ready` flag.
 */
const toTranscriptionDto = (transcription) => ({
  raw: transcription?.raw ?? null,
  latest: transcription?.latest ?? null,
  readiness: transcription?.ready ?? false,
});

/**
 * GET /reports/:reportId/transcription — always 200 (nulls when cleared).
 * @type {import("express").RequestHandler}
 */
export const getTranscription = asyncHandler(async (req, res) => {
  const report = await findOwnedReport(req);
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Transcription",
    data: toTranscriptionDto(report.transcription),
  });
});

/**
 * PUT /reports/:reportId/transcription — re-transcribe only (wholesale).
 * @type {import("express").RequestHandler}
 */
export const reTranscribe = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { reportId } = req.validated.params;

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const report = await Report.findOne({ _id: reportId, user: userId })
      .session(session);
    if (!report) {
      throw new CustomError("NOT_FOUND", "Report not found");
    }
    assertWritable(report);

    if (!report.audios || report.audios.length === 0) {
      throw new CustomError("UNPROCESSABLE_ENTITY", "A clip is required first");
    }

    // D3 — ready already: 200 no-op (creation guarantees ready:true).
    if (report.transcription?.ready) {
      await session.commitTransaction();
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Transcription",
        data: toTranscriptionDto(report.transcription),
      });
      return;
    }

    // Wholesale re-hear of every active clip, in order.
    const clips = [...report.audios].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    );
    try {
      const texts = [];
      for (const clip of clips) {
        texts.push(await transcribeClip(clip.filePath));
      }
      const merged = texts.join(" ");
      if (merged.trim() === "") {
        throw new CustomError(
          "UNPROCESSABLE_ENTITY",
          "The recording came out silent — please re-record",
        );
      }
      report.transcription = { raw: merged, latest: merged, ready: true };
    } catch (error) {
      // All-or-nothing (D4): a provider/STT failure writes nothing.
      throw new CustomError(
        "BAD_GATEWAY",
        "Transcription failed — please retry",
      );
    }

    await report.save({ session });
    await session.commitTransaction();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Transcription",
      data: toTranscriptionDto(report.transcription),
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
});

/**
 * PATCH /reports/:reportId/transcription — write `latest` (review edit /
 * correction result). `raw` never changes (BR-11); empty allowed (F1).
 * @type {import("express").RequestHandler}
 */
export const patchTranscription = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { reportId } = req.validated.params;
  const { latest } = req.validated.body;

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const report = await Report.findOne({ _id: reportId, user: userId })
      .session(session);
    if (!report) {
      throw new CustomError("NOT_FOUND", "Report not found");
    }
    report.transcription.latest = latest;
    await report.save({ session });
    await session.commitTransaction();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Transcription updated",
      data: { latest },
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
});

/**
 * PUT /reports/:reportId/transcription/revert — single undo: latest←raw.
 * @type {import("express").RequestHandler}
 */
export const revertTranscription = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { reportId } = req.validated.params;

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const report = await Report.findOne({ _id: reportId, user: userId })
      .session(session);
    if (!report) {
      throw new CustomError("NOT_FOUND", "Report not found");
    }
    report.transcription.latest = report.transcription.raw;
    await report.save({ session });
    await session.commitTransaction();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Transcription reverted",
      data: { latest: report.transcription.latest },
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
});

export default { createReport, addClip, listClips, getClip, deleteClip, getTranscription, reTranscribe, patchTranscription, revertTranscription };