/**
 * @module models/item
 *
 * The Item model (§24A, consolidated 2026-09-01): the persisted content
 * item of a generated report — the boss/agent/sheet query surface.
 * Per-type status (activities completed|in_progress default completed;
 * issues reported|in_progress|completed default reported; comments have
 * NO status and NO rating). No `rating` field exists.
 */

import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { ITEM_STATUSES, ITEM_TYPES } from "../utils/constants.js";

const { Schema } = mongoose;

const itemSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    report: {
      type: Schema.Types.ObjectId,
      ref: "Report",
      required: true,
    },
    branch: {
      type: Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: ITEM_TYPES,
      required: true,
    },
    text: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ITEM_STATUSES,
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

/** Owner scope (§24A.3, BR-13). */
itemSchema.index({ user: 1 });

/** Report join (§24A.3). */
itemSchema.index({ user: 1, report: 1 });

/** Branch–date–type–status — the boss/export/agent query surface (§24A.3, §38). */
itemSchema.index({ user: 1, branch: 1, date: 1, type: 1, status: 1 });

/** Type–status–date — dashboard counts (§24A.3, §49). */
itemSchema.index({ user: 1, type: 1, status: 1, date: 1 });

/** One comment per report (§24A.3, §6.10). */
itemSchema.index(
  { report: 1 },
  { unique: true, partialFilterExpression: { type: "comment" } },
);

/** Server-side pagination for the list endpoints (§27.6) — registered
 *  per-schema so `Item.paginate` exists (C23, 2026-08-31). */
itemSchema.plugin(mongoosePaginate);

/**
 * The Item model — every item lookup in the app runs through it.
 * @type {mongoose.Model}
 */
const Item = mongoose.model("Item", itemSchema);

export default Item;