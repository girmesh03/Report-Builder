/**
 * @module controllers/auth
 *
 * The §28 auth surface: register (no cookies, derived names),
 * login (dual httpOnly cookies), refresh (rotation — the presented
 * refresh token is never reused; no server-side store, §28.2),
 * logout (idempotent cookie clear), and the Google OAuth stub
 * (§28.6). Responses carry the §27.4 envelope with the §27.5 status
 * semantics; `req.validated` is the only request-field source.
 */
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { CustomError } from "../utils/errors.js";
import { HTTP_STATUS } from "../utils/httpStatus.js";
import { env } from "../config/env.js";
import {
  ACCESS_TOKEN_TTL_MIN,
  ACCESS_TOKEN_TTL_MS,
  REFRESH_TOKEN_TTL_DAYS,
  REFRESH_TOKEN_TTL_MS,
  MS_PER_MINUTE,
} from "../utils/constants.js";

/** Cookie attributes of the access token — path `/api/v1` (§28.2). */
const ACCESS_COOKIE_ATTRS = {
  path: "/api/v1",
  httpOnly: true,
  sameSite: "lax",
  secure: env.NODE_ENV === "production",
  maxAge: ACCESS_TOKEN_TTL_MS,
};

/** Cookie attributes of the refresh token — path `/api/v1/auth` (§28.2). */
const REFRESH_COOKIE_ATTRS = {
  path: "/api/v1/auth",
  httpOnly: true,
  sameSite: "lax",
  secure: env.NODE_ENV === "production",
  maxAge: REFRESH_TOKEN_TTL_MS,
};

/**
 * Signs an access JWT for a user.
 * @param {string} userId - The `_id` string of the account.
 * @returns {string} Signed access token.
 */
function signAccessToken(userId) {
  return jwt.sign(
    { sub: userId, type: "access" },
    env.JWT_ACCESS_SECRET,
    { expiresIn: `${ACCESS_TOKEN_TTL_MIN}m` },
  );
}

/**
 * Signs a fresh refresh JWT — every rotation mints a new one (§28.2).
 * @param {string} userId - The `_id` string of the account.
 * @returns {string} Signed refresh token.
 */
function signRefreshToken(userId) {
  return jwt.sign(
    { sub: userId, type: "refresh" },
    env.JWT_REFRESH_SECRET,
    { expiresIn: `${REFRESH_TOKEN_TTL_DAYS}d` },
  );
}

/**
 * Sets both session cookies on the response (§28.2).
 * @param {import("express").Response} res - The outgoing response.
 * @param {string} userId - The `_id` string of the account.
 * @returns {void}
 */
function setAuthCookies(res, userId) {
  res.cookie("accessToken", signAccessToken(userId), ACCESS_COOKIE_ATTRS);
  res.cookie("refreshToken", signRefreshToken(userId), REFRESH_COOKIE_ATTRS);
}

/**
 * Clears both session cookies — used by logout and by any rejected
 * refresh (§28.7).
 * @param {import("express").Response} res - The outgoing response.
 * @returns {void}
 */
function clearAuthCookies(res) {
  const expired = { ...ACCESS_COOKIE_ATTRS, maxAge: 0 };
  const expiredRefresh = { ...REFRESH_COOKIE_ATTRS, maxAge: 0 };
  res.cookie("accessToken", "", expired);
  res.cookie("refreshToken", "", expiredRefresh);
}

/**
 * Extracts the §19.2 names from the email local part: `beza.ayalew`
 * → beza / ayalew; single-part emails repeat it for both fields.
 * @param {string} email - The normalized registration email.
 * @returns {{firstName: string, lastName: string}} Derived names.
 */
function deriveNames(email) {
  const local = email.split("@")[0] ?? "";
  const parts = local.split(/[._-]+/).filter(Boolean);
  const firstName = parts[0] ?? "user";
  const lastName = parts[1] ?? firstName;
  return { firstName, lastName };
}

/**
 * POST /auth/register — creates the account; never sets cookies and
 * never auto-logs-in (locked decision 9, §41.2).
 * @type {import("express").RequestHandler}
 */
async function register(req, res, next) {
  try {
    const { email, password } = req.validated.body;
    const { firstName, lastName } = deriveNames(email);
    const user = await User.create({ email, password, firstName, lastName });
    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: "Account created",
      data: { user: user.toJSON() },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /auth/login — verifies credentials; unknown email and wrong
 * password answer the identical 401 (no enumeration, §28.3).
 * @type {import("express").RequestHandler}
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.validated.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      throw new CustomError("UNAUTHORIZED", "Incorrect email or password");
    }
    setAuthCookies(res, user._id.toString());
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Welcome back",
      data: { user: user.toJSON() },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /auth/refresh — rotates both tokens on a valid refresh
 * cookie; any failure clears both cookies and answers the §28.3 401.
 * @type {import("express").RequestHandler}
 */
async function refresh(req, res, next) {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      clearAuthCookies(res);
      throw new CustomError(
        "UNAUTHORIZED",
        "Session expired — sign in again",
      );
    }
    let payload;
    try {
      payload = jwt.verify(token, env.JWT_REFRESH_SECRET);
    } catch {
      clearAuthCookies(res);
      throw new CustomError(
        "UNAUTHORIZED",
        "Session expired — sign in again",
      );
    }
    if (payload.type !== "refresh" || !payload.sub) {
      clearAuthCookies(res);
      throw new CustomError(
        "UNAUTHORIZED",
        "Session expired — sign in again",
      );
    }
    const user = await User.findById(payload.sub);
    if (!user) {
      clearAuthCookies(res);
      throw new CustomError(
        "UNAUTHORIZED",
        "Session expired — sign in again",
      );
    }
    setAuthCookies(res, user._id.toString());
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Session refreshed",
      data: { user: user.toJSON() },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /auth/logout — idempotent; works with or without a session
 * (§28.3).
 * @type {import("express").RequestHandler}
 */
function logout(_req, res) {
  clearAuthCookies(res);
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Signed out",
    data: null,
  });
}

/**
 * GET /auth/google — the §28.6 stub: always 404 with the open-
 * question copy until real OAuth integration is amended in.
 * @type {import("express").RequestHandler}
 */
function googleStub(_req, res) {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: "Google sign-in is not available in this version",
    data: null,
  });
}

export { register, login, refresh, logout, googleStub };
