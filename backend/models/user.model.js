/**
 * @module models/user
 *
 * The single account type of the product (§19, ADR-036): no role
 * field, no lifecycle/TTL fields. Names derive from the email at
 * creation (§19.2) and are editable only through §28 profile flows.
 */
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { BCRYPT_SALT_ROUNDS } from "../utils/constants.js";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      select: false,
      default: null,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    position: {
      type: String,
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
        delete ret.password;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.id;
        delete ret.password;
        return ret;
      },
    },
  },
);

/** The unique-email proof of the auth domain (§19.3). */
userSchema.index({ email: 1 }, { unique: true });

/** The live display name joined into report headers at read time (BR-14). */
userSchema.virtual("fullName").get(function fullName() {
  return `${this.firstName} ${this.lastName}`;
});

/**
 * Hashes a set password with BCRYPT_SALT_ROUNDS before persistence
 * (§28); Google-created accounts carry no password and skip hashing.
 * @this mongoose.Document & {password?: string, isModified: Function}
 * @returns {Promise<void>}
 */
userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password") || this.password === null) {
    return;
  }
  this.password = await bcrypt.hash(this.password, BCRYPT_SALT_ROUNDS);
});

/**
 * Compares a candidate password against the stored hash.
 * @param {string} candidate - Plaintext candidate from the login form.
 * @returns {Promise<boolean>} True when the candidate matches.
 */
userSchema.methods.comparePassword = function comparePassword(candidate) {
  if (!this.password) {
    return Promise.resolve(false);
  }
  return bcrypt.compare(candidate, this.password);
};

/**
 * The User model — every account lookup in the app runs through it.
 * @type {mongoose.Model}
 */
const User = mongoose.model("User", userSchema);

export default User;
