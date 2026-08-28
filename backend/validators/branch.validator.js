/**
 * @module validators/branch
 *
 * The §29/§30 rule chains for the branch surface.
 */

import { body, query, param } from "express-validator";
import {
  BRANCH_NAME_MAX_LENGTH,
  BRANCH_LOCATION_MAX_LENGTH,
} from "../utils/constants.js";

/** Create: name + location required. */
export const createBranchChain = [
  body("name")
    .trim()
    .isLength({ min: 1, max: BRANCH_NAME_MAX_LENGTH })
    .withMessage("Branch name must be 1-100 characters"),
  body("location")
    .trim()
    .isLength({ min: 1, max: BRANCH_LOCATION_MAX_LENGTH })
    .withMessage("Location must be 1-200 characters"),
];

/** Update: at least one field, optional. */
export const updateBranchChain = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 1, max: BRANCH_NAME_MAX_LENGTH })
    .withMessage("Branch name must be 1-100 characters"),
  body("location")
    .optional()
    .trim()
    .isLength({ min: 1, max: BRANCH_LOCATION_MAX_LENGTH })
    .withMessage("Location must be 1-200 characters"),
  body().custom((_, { req }) => {
    if (!req.body.name && !req.body.location) {
      throw new Error("At least one field (name or location) is required");
    }
    return true;
  }),
];

/** List: pagination + filters. */
export const listBranchesChain = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .toInt()
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .toInt()
    .withMessage("Limit must be between 1 and 100"),
  query("sort")
    .optional()
    .isIn(["name", "-name", "createdAt", "-createdAt"])
    .withMessage("Invalid sort value"),
  query("isArchived")
    .optional()
    .isIn(["active", "archived", "all"])
    .withMessage("Invalid archive filter value"),
];

/** Params: branchId. */
export const branchIdParamChain = [
  param("branchId").isMongoId().withMessage("Invalid branch ID"),
];

export default {
  createBranchChain,
  updateBranchChain,
  listBranchesChain,
  branchIdParamChain,
};