/**
 * @module app
 *
 * The Express application (§26.4): the fixed middleware chain
 * (helmet → cors → compression → cookie-parser → express.json →
 * sanitize → rate-limit, ADR-035 — never reordered), exactly one
 * route-registry mount (§26.5), then the not-found and global error
 * handlers (§27.5). Registers no route directly.
 */
import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import mongoSanitize from "./middleware/mongoSanitize.js";
import { globalLimiter } from "./middleware/rateLimit.js";
import routes from "./routes/index.js";
import { env } from "./config/env.js";
import { API_MOUNT_PATH } from "./utils/constants.js";
import logger, { serverLogger } from "./utils/logger.js";
import { toErrorEnvelope } from "./utils/errors.js";
import { HTTP_STATUS } from "./utils/httpStatus.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true,
  }),
);
app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(mongoSanitize);
app.use(globalLimiter);

/** The single registry mount of the whole application (§26.5). */
app.use(API_MOUNT_PATH, routes);

/**
 * Any unmatched path under the API mount answers the §27.5 not-found
 * envelope; unmatched non-API paths fall through to it as well.
 */
app.use((_req, res) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: "Route not found",
    data: null,
  });
});

/**
 * The single global error handler (§27.5): logs class/status/reference
 * (never user text or secrets, ADR-019), renders the stack only
 * outside production, answers with the standard envelope.
 * @type {import("express").ErrorRequestHandler}
 */
// eslint-disable-next-line no-unused-vars -- signature required by Express
function globalErrorHandler(err, _req, res, _next) {
  const { statusCode, body } = toErrorEnvelope(err);
  if (statusCode >= HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    serverLogger.error(
      `${err instanceof Error ? err.name : "NonError"} ${statusCode}`,
      { error: err instanceof Error ? err.stack : String(err) },
    );
  } else {
    logger.debug(`Handled error ${statusCode}`);
  }
  const payload = { ...body };
  if (env.NODE_ENV !== "production" && statusCode >= HTTP_STATUS.INTERNAL_SERVER_ERROR && err instanceof Error) {
    payload.stack = err.stack;
  }
  res.status(statusCode).json(payload);
}

app.use(globalErrorHandler);

export default app;
