/**
 * @module controllers/branch
 *
 * The §30 branch surface: CRUD, archive/restore lifecycle.
 * Handlers ride express-async-handler — rejections funnel to the global handler.
 */

import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
import Branch from "../models/branch.model.js";
import { CustomError } from "../utils/errors.js";
import { HTTP_STATUS } from "../utils/httpStatus.js";
import {
  PAGINATION_DEFAULT_PAGE,
  PAGINATION_DEFAULT_LIMIT,
  PAGINATION_MAX_LIMIT,
  MONGO_DUPLICATE_KEY_ERROR_CODE,
} from "../utils/constants.js";

/**
 * GET /branches — List branches with pagination, filter, sort.
 * @type {import("express").RequestHandler}
 */
export const getBranches = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const {
    page = PAGINATION_DEFAULT_PAGE,
    limit = PAGINATION_DEFAULT_LIMIT,
    sort = "name",
    isArchived = "all",
  } = req.validated.query;

  const filter = { user: userId };
  if (isArchived === "active") {
    filter.isArchived = false;
  } else if (isArchived === "archived") {
    filter.isArchived = true;
  }
  // "all" means no isArchived filter

  const options = {
    page: Math.max(1, page),
    limit: Math.min(Math.max(1, limit), PAGINATION_MAX_LIMIT),
    sort,
    lean: true,
  };

  const result = await Branch.paginate(filter, options);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Branches",
    data: {
      docs: result.docs,
      page: result.page,
      limit: result.limit,
      totalDocs: result.totalDocs,
      totalPages: result.totalPages,
    },
  });
});

/**
 * GET /branches/:branchId — Get single branch by ID (lightweight).
 * @type {import("express").RequestHandler}
 */
export const getBranch = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { branchId } = req.validated.params;

  const branch = await Branch.findOne({ _id: branchId, user: userId }).lean();

  if (!branch) {
    throw new CustomError("NOT_FOUND", "Branch not found");
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Branch",
    data: branch,
  });
});

/**
 * POST /branches — Create a new branch.
 * @type {import("express").RequestHandler}
 */
export const createBranch = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { name, location } = req.validated.body;

  const trimmedName = name.trim();
  const trimmedLocation = location.trim();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Pre-check for duplicate name (friendly 409)
    const existing = await Branch.findOne({
      user: userId,
      name: trimmedName,
    }).session(session);

    if (existing) {
      throw new CustomError("CONFLICT", "A branch with this name already exists");
    }

    const branch = await Branch.create(
      [{ user: userId, name: trimmedName, location: trimmedLocation }],
      { session },
    );

    await session.commitTransaction();

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: "Branch created",
      data: branch[0].toJSON(),
    });
  } catch (error) {
    await session.abortTransaction();
    // Handle race condition: duplicate name (E11000)
    if (error.code === MONGO_DUPLICATE_KEY_ERROR_CODE) {
      throw new CustomError("CONFLICT", "A branch with this name already exists");
    }
    throw error;
  } finally {
    await session.endSession();
  }
});

/**
 * PATCH /branches/:branchId — Update branch name and/or location.
 * @type {import("express").RequestHandler}
 */
export const updateBranch = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { branchId } = req.validated.params;
  const updates = req.validated.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // If name is being updated, check for duplicate
    if (updates.name !== undefined) {
      const trimmedName = updates.name.trim();
      const existing = await Branch.findOne({
        user: userId,
        name: trimmedName,
        _id: { $ne: branchId },
      }).session(session);

      if (existing) {
        throw new CustomError("CONFLICT", "A branch with this name already exists");
      }
      updates.name = trimmedName;
    }

    if (updates.location !== undefined) {
      updates.location = updates.location.trim();
    }

    const branch = await Branch.findOneAndUpdate(
      { _id: branchId, user: userId },
      { $set: updates },
      { new: true, session, runValidators: true },
    );

    if (!branch) {
      throw new CustomError("NOT_FOUND", "Branch not found");
    }

    await session.commitTransaction();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Branch updated",
      data: branch.toJSON(),
    });
  } catch (error) {
    await session.abortTransaction();
    // Handle race condition: duplicate name (E11000)
    if (error.code === MONGO_DUPLICATE_KEY_ERROR_CODE) {
      throw new CustomError("CONFLICT", "A branch with this name already exists");
    }
    throw error;
  } finally {
    await session.endSession();
  }
});

/**
 * POST /branches/:branchId/archive — Archive a branch (soft delete).
 * @type {import("express").RequestHandler}
 */
export const archiveBranch = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { branchId } = req.validated.params;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const branch = await Branch.findOneAndUpdate(
      { _id: branchId, user: userId, isArchived: false },
      { $set: { isArchived: true, archivedAt: new Date() } },
      { new: true, session },
    );

    if (!branch) {
      // Check if exists but already archived
      const exists = await Branch.findOne({
        _id: branchId,
        user: userId,
        isArchived: true,
      }).session(session);

      if (exists) {
        throw new CustomError("CONFLICT", "Branch is already archived");
      }

      throw new CustomError("NOT_FOUND", "Branch not found");
    }

    await session.commitTransaction();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Branch archived",
      data: branch.toJSON(),
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
});

/**
 * POST /branches/:branchId/restore — Restore an archived branch.
 * @type {import("express").RequestHandler}
 */
export const restoreBranch = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { branchId } = req.validated.params;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const branch = await Branch.findOneAndUpdate(
      { _id: branchId, user: userId, isArchived: true },
      { $set: { isArchived: false, archivedAt: null } },
      { new: true, session },
    );

    if (!branch) {
      // Check if exists but not archived
      const exists = await Branch.findOne({
        _id: branchId,
        user: userId,
        isArchived: false,
      }).session(session);

      if (exists) {
        throw new CustomError("CONFLICT", "Branch is not archived");
      }

      throw new CustomError("NOT_FOUND", "Branch not found");
    }

    await session.commitTransaction();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Branch restored",
      data: branch.toJSON(),
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
});

/**
 * DELETE /branches/:branchId — Delete an already-archived branch.
 * Flow (in one session): (1) find the branch by `_id` + `user` +
 * `isArchived: true` → 404 if not found (a branch of another user, or an
 * active/non-archived branch, is indistinguishable here — DELETE targets
 * archived rows only; Archive is the separate action that sets isArchived);
 * (2) delete the branch row along with every resource linked to it. The
 * linked resources (reports → items → audios → transcriptions → chat) have
 * no schemas/model yet (reports phase), so only the branch row is removed
 * now — nothing can reference it yet, so no orphans. When those models land,
 * their rows must be deleted HERE in the same session (see TODO below).
 * Responds `data: null` (the frontend reads only success/message; the
 * resource is gone).
 * @type {import("express").RequestHandler}
 */
export const deleteBranch = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { branchId } = req.validated.params;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1) Find the branch to delete — must already be archived. A branch of
    // another user (BR-13) or an active branch is indistinguishable from
    // nonexistent → 404.
    const branch = await Branch.findOne({
      _id: branchId,
      user: userId,
      isArchived: true,
    }).session(session);

    if (!branch) {
      throw new CustomError("NOT_FOUND", "Branch not found");
    }

    // 2) Delete the branch with all its linked resources, in this session.
    // TODO (reports phase): when the Report/Item/Audio/Transcription/Chat
    // schemas exist, delete every row that references this branch here, in
    // dependency order — branch → reports → items → audios → transcriptions
    // → chat (§17.4, §62) — so a branch delete leaves no dangling references.
    // Current phase: no dependents can exist, so only the branch row goes.
    await Branch.deleteOne({ _id: branchId, user: userId }).session(session);

    await session.commitTransaction();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Branch deleted",
      data: null,
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
});

export default {
  getBranches,
  getBranch,
  createBranch,
  updateBranch,
  archiveBranch,
  restoreBranch,
  deleteBranch,
};