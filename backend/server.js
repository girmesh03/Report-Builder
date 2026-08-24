/**
 * @module server
 *
 * Process entry (§26.6): validates env at import (fail-fast, §26.2),
 * connects to MongoDB with bounded exponential backoff (D53) before
 * listening, and shuts down gracefully on SIGINT/SIGTERM (ADR-013):
 * stop accepting → close MongoDB → exit 0; forced exit after
 * SHUTDOWN_FORCE_TIMEOUT_MS. The retention sweeper joins with its
 * owning slice (§62) — not started here.
 */
import mongoose from "mongoose";
import app from "./app.js";
import { env } from "./config/env.js";
import { serverLogger, dbLogger } from "./utils/logger.js";
import {
  MONGO_CONNECT_TIMEOUT_MS,
  DB_RETRY_INITIAL_MS,
  DB_RETRY_MAX_MS,
  DB_RETRY_MAX_ATTEMPTS,
  SHUTDOWN_FORCE_TIMEOUT_MS,
} from "./utils/constants.js";

/** The live HTTP listener, captured for graceful shutdown (§26.6). */
let server;

/**
 * Connects to MongoDB, retrying with bounded exponential backoff:
 * DB_RETRY_INITIAL_MS doubling per attempt, capped at DB_RETRY_MAX_MS;
 * after DB_RETRY_MAX_ATTEMPTS consecutive failures the process exits 1
 * (§26.6, D53). Post-connect drops stay on the driver's auto-reconnect.
 * @returns {Promise<void>} Resolves once the connection is open.
 */
const connectWithRetry = async () => {
  let attempt = 0;
  let delay = DB_RETRY_INITIAL_MS;
  for (;;) {
    try {
      await mongoose.connect(env.MONGO_URI, {
        serverSelectionTimeoutMS: MONGO_CONNECT_TIMEOUT_MS,
      });
      dbLogger.info("MongoDB connected");
      return;
    } catch (error) {
      attempt += 1;
      if (attempt >= DB_RETRY_MAX_ATTEMPTS) {
        dbLogger.error(
          `MongoDB unreachable after ${attempt} attempts — giving up`,
        );
        process.exit(1);
      }
      dbLogger.warn(
        `MongoDB connection failed (attempt ${attempt}/${DB_RETRY_MAX_ATTEMPTS}) — retrying in ${delay}ms`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay = Math.min(delay * 2, DB_RETRY_MAX_MS);
    }
  }
}

/**
 * Graceful shutdown on SIGINT/SIGTERM (ADR-013): stop accepting,
 * close MongoDB, flush and exit 0; forced exit after the timeout.
 * @returns {void}
 */
const registerShutdownHooks = () => {
  let shuttingDown = false;
  const shutdown = (signal) => {
    if (shuttingDown) {
      return;
    }
    shuttingDown = true;
    serverLogger.info(`${signal} received — shutting down`);
    const forceTimer = setTimeout(() => process.exit(1), SHUTDOWN_FORCE_TIMEOUT_MS);
    forceTimer.unref();
    server.close(() => {
      mongoose
        .disconnect()
        .catch(() => undefined)
        .finally(() => process.exit(0));
    });
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

/**
 * Boots the process: connect → listen → hooks.
 * @returns {Promise<void>}
 */
const main = async () => {
  await connectWithRetry();
  server = app.listen(env.PORT, () => {
    serverLogger.info(`Server listening on port ${env.PORT}`);
  });
  registerShutdownHooks();
}

main().catch((error) => {
  serverLogger.error(
    env.LOG_ERROR_STACK === "true" && error instanceof Error
      ? error.stack
      : error instanceof Error
        ? error.message
        : String(error),
  );
  process.exit(1);
});
