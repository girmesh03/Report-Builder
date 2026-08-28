/**
 * @module models/branch
 *
 * The Branch model (§20): the place the supervisor operates in.
 * Renders the §17.2 Branch row as a schema contract.
 */

import mongoose from "mongoose";
import {
  BRANCH_NAME_MAX_LENGTH,
  BRANCH_LOCATION_MAX_LENGTH,
} from "../utils/constants.js";

const { Schema } = mongoose;

const branchSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: BRANCH_NAME_MAX_LENGTH,
    },
    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: BRANCH_LOCATION_MAX_LENGTH,
    },
    isArchived: {
      type: Boolean,
      required: true,
      default: false,
    },
    archivedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.id;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.id;
        return ret;
      },
    },
  },
);

/** Owner-scoped list index (§20.3). */
branchSchema.index({ user: 1, isArchived: 1, name: 1 });

/** Unique per owner — exact match after trim, case-sensitive (§20.3, §30.3). */
branchSchema.index({ user: 1, name: 1 }, { unique: true });

/** Text index for global search (§39.2, §20.3). */
branchSchema.index({ user: 1, name: "text", location: "text" });

/**
 * The Branch model — every branch lookup in the app runs through it.
 * @type {mongoose.Model}
 */
const Branch = mongoose.model("Branch", branchSchema);

export default Branch;