/**
 * @module utils/logger
 *
 * The only logging surface (§9.5, §26.3): Winston with a daily
 * rotating file transport under `logs/` (retention from
 * LOG_RETENTION_DAYS) and a console transport outside production.
 * Safe-logging policy (ADR-019): passwords, JWT values, cookies, API
 * keys, audio content, and transcription/report texts are never
 * logged — provider and auth logs carry class, status, and reference
 * only.
 */
import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { env } from "../config/env.js";
import { LOG_RETENTION_DAYS } from "./constants.js";

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json(),
  ),
  transports: [
    new DailyRotateFile({
      dirname: "logs",
      datePattern: "YYYY-MM-DD",
      maxFiles: `${LOG_RETENTION_DAYS}d`,
      zippedArchive: true,
    }),
    ...(env.NODE_ENV !== "production"
      ? [
          new transports.Console({
            format: format.combine(
              format.colorize(),
              format.printf(({ timestamp, level, label, message }) => {
                const scope = label ? ` [${label}]` : "";
                return `${timestamp}${scope} ${level}: ${message}`;
              }),
            ),
          }),
        ]
      : []),
  ],
});

/**
 * Builds a child logger bound to a source label (§26.3).
 * @param {string} label - Source tag, e.g. `Server`, `DB`, `Auth`.
 * @returns {import("winston").Logger} Child logger carrying the label.
 */
const createChildLogger = (label) => {
  return logger.child({ label });
}

/** Boot/listen/shutdown log surface. */
export const serverLogger = createChildLogger("Server");

/** MongoDB connection/retry log surface. */
export const dbLogger = createChildLogger("DB");

/** Auth-domain log surface. */
export const authLogger = createChildLogger("Auth");

export default logger;
