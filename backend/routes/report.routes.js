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

export default router;