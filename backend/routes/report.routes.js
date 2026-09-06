/**
 * @module routes/report
 *
 * The §31 report routes mounted under /api/v1/reports.
 * B2 ships the atomic create route only; the rest land in later
 * increments (B3 clips, B4 transcription, B5 read/edit/lifecycle,
 * B6 items).
 */

import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import validate from "../validators/validation.js";
import * as reportController from "../controllers/report.controller.js";
import * as reportValidator from "../validators/report.validator.js";
import {
  uploadClips,
  uploadClip,
} from "../middleware/clipUpload.js";

const router = Router();

/** All routes require authentication. */
router.use(authenticate);

/**
 * POST /reports — atomic multipart create.
 * Route order matters (C24): multer first (parses files + text fields),
 * then the §29 validator, then `validate()` (must be invoked here,
 * never passed as a bare reference), then the controller.
 */
router.post(
  "/",
  uploadClips,
  reportValidator.createReportChain,
  validate(),
  reportController.createReport,
);

/** GET /reports — paginated list (filters + light DTO). */
router.get(
  "/",
  reportValidator.listReportsChain,
  validate(),
  reportController.listReports,
);

/** GET /reports/:reportId — single meta read (Meta-tab seed). */
router.get(
  "/:reportId",
  reportValidator.reportIdParamChain,
  validate(),
  reportController.getReport,
);

/** PATCH /reports/:reportId — whole-block meta edit (date + visits). */
router.patch(
  "/:reportId",
  reportValidator.reportIdParamChain,
  reportValidator.patchMetaChain,
  validate(),
  reportController.patchReport,
);

/** POST /reports/:reportId/archive — set isArchived/archivedAt. */
router.post(
  "/:reportId/archive",
  reportValidator.reportIdParamChain,
  validate(),
  reportController.archiveReport,
);

/** POST /reports/:reportId/restore — clear archive state. */
router.post(
  "/:reportId/restore",
  reportValidator.reportIdParamChain,
  validate(),
  reportController.restoreReport,
);

/** DELETE /reports/:reportId — physical delete (archived target only). */
router.delete(
  "/:reportId",
  reportValidator.reportIdParamChain,
  validate(),
  reportController.deleteReport,
);

/** POST /reports/:reportId/clips — add a clip (post-create). */
router.post(
  "/:reportId/clips",
  reportValidator.reportIdParamChain,
  uploadClip,
  validate(),
  reportController.addClip,
);

/** GET /reports/:reportId/clips — flat list. */
router.get(
  "/:reportId/clips",
  reportValidator.reportIdParamChain,
  validate(),
  reportController.listClips,
);

/** GET /reports/:reportId/clips/:clipId — single AudioDto. */
router.get(
  "/:reportId/clips/:clipId",
  reportValidator.reportIdParamChain,
  reportValidator.clipIdParamChain,
  validate(),
  reportController.getClip,
);

/** DELETE /reports/:reportId/clips/:clipId — direct delete (DB + file). */
router.delete(
  "/:reportId/clips/:clipId",
  reportValidator.reportIdParamChain,
  reportValidator.clipIdParamChain,
  validate(),
  reportController.deleteClip,
);

/** GET /reports/:reportId/transcription — always 200 {raw, latest, readiness}. */
router.get(
  "/:reportId/transcription",
  reportValidator.reportIdParamChain,
  validate(),
  reportController.getTranscription,
);

/** PUT /reports/:reportId/transcription — re-transcribe only (wholesale). */
router.put(
  "/:reportId/transcription",
  reportValidator.reportIdParamChain,
  validate(),
  reportController.reTranscribe,
);

/** PATCH /reports/:reportId/transcription — write `latest`. */
router.patch(
  "/:reportId/transcription",
  reportValidator.reportIdParamChain,
  reportValidator.latestBodyChain,
  validate(),
  reportController.patchTranscription,
);

/** PUT /reports/:reportId/transcription/revert — single undo latest←raw. */
router.put(
  "/:reportId/transcription/revert",
  reportValidator.reportIdParamChain,
  validate(),
  reportController.revertTranscription,
);

export default router;