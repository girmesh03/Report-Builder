/**
 * @module routes/branch
 *
 * The §30 branch routes mounted under /api/v1/branches.
 */

import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import validate from "../validators/validation.js";
import * as branchController from "../controllers/branch.controller.js";
import * as branchValidator from "../validators/branch.validator.js";

const router = Router();

/** All routes require authentication. */
router.use(authenticate);

/**
 * GET /branches — List branches with pagination, filter, sort.
 */
router.get(
  "/",
  branchValidator.listBranchesChain,
  validate(),
  branchController.getBranches,
);

/**
 * GET /branches/:branchId — Get single branch by ID (lightweight).
 */
router.get(
  "/:branchId",
  branchValidator.branchIdParamChain,
  validate(),
  branchController.getBranch,
);

/**
 * POST /branches — Create a new branch.
 */
router.post(
  "/",
  branchValidator.createBranchChain,
  validate(),
  branchController.createBranch,
);

/**
 * PATCH /branches/:branchId — Update branch name and/or location.
 */
router.patch(
  "/:branchId",
  branchValidator.branchIdParamChain,
  branchValidator.updateBranchChain,
  validate(),
  branchController.updateBranch,
);

/**
 * POST /branches/:branchId/archive — Archive a branch (soft delete).
 */
router.post(
  "/:branchId/archive",
  branchValidator.branchIdParamChain,
  validate(),
  branchController.archiveBranch,
);

/**
 * POST /branches/:branchId/restore — Restore an archived branch.
 */
router.post(
  "/:branchId/restore",
  branchValidator.branchIdParamChain,
  validate(),
  branchController.restoreBranch,
);

/**
 * DELETE /branches/:branchId — Delete branch (archive first, sweeper hard-deletes after 30 days if no references).
 */
router.delete(
  "/:branchId",
  branchValidator.branchIdParamChain,
  validate(),
  branchController.deleteBranch,
);

export default router;
