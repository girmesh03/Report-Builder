/**
 * @module middleware/auth
 *
 * `authenticate` — the per-route access gate (§28.4): verifies the
 * `accessToken` httpOnly cookie (secret, type `access`, expiry),
 * loads the user document by `sub`, and attaches the plain identity
 * object to `req.user`. Every failure answers the same 401 — no
 * enumeration. Controllers never parse cookies themselves.
 */
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { CustomError } from "../utils/errors.js";
import { env } from "../config/env.js";

/**
 * Attaches `req.user` or rejects with 401 (§28.4).
 * @type {import("express").RequestHandler}
 */
async function authenticate(req, _res, next) {
  try {
    const token = req.cookies?.accessToken;
    if (!token) {
      throw new CustomError("UNAUTHORIZED", "Sign in to continue");
    }
    let payload;
    try {
      payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    } catch {
      throw new CustomError("UNAUTHORIZED", "Sign in to continue");
    }
    if (payload.type !== "access" || !payload.sub) {
      throw new CustomError("UNAUTHORIZED", "Sign in to continue");
    }
    const user = await User.findById(payload.sub);
    if (!user) {
      throw new CustomError("UNAUTHORIZED", "Sign in to continue");
    }
    req.user = {
      _id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      avatar: user.avatar,
      position: user.position,
    };
    next();
  } catch (error) {
    next(error);
  }
}

export { authenticate };
