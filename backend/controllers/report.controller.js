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
import { rename } from "node:fs/promises";
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

export default { createReport };