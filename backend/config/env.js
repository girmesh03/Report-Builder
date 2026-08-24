/**
 * @module config/env
 *
 * The only file that reads `process.env` (§10.3, §26.2). Exports a
 * frozen `env` object exposing exactly the §10.4 variables, resolved
 * through the §10.3 lookup chain: live process environment →
 * backend/.env (loaded here via dotenv) → client/.env → §10.4 default
 * → fail-fast. A Required variable missing from every location throws
 * at import, aborting boot.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const configDir = dirname(fileURLToPath(import.meta.url));
const backendEnvPath = join(configDir, "..", ".env");
const clientEnvPath = join(configDir, "..", "..", "client", ".env");

/**
 * §10.4 inventory. `required` entries have no fallback and fail fast;
 * every other entry carries a `default`.
 * @type {Object<string, {required?: boolean, default?: string}>}
 */
const ENV_SPEC = {
  NODE_ENV: { default: "development" },
  PORT: { default: "4000" },
  MONGO_URI: { required: true },
  CLIENT_ORIGIN: { default: "http://localhost:3000" },
  JWT_ACCESS_SECRET: { required: true },
  JWT_REFRESH_SECRET: { required: true },
  ADDIS_API_KEY: { required: true },
  GEMINI_API_KEY: { required: true },
  NVIDIA_API_KEY: { required: true },
  NVIDIA_API_URL: { required: true },
  AI_TIMEOUT_MS: { default: "30000" },
  LOG_ERROR_STACK: { default: "true" },
  FFMPEG_PATH: { default: "ffmpeg" },
  FFPROBE_PATH: { default: "ffprobe" },
};

/**
 * Reads one key from a literal `.env` file.
 * @param {string} envFilePath - Absolute path of the `.env` file.
 * @param {string} key - Variable name to look up.
 * @returns {string|undefined} Raw value, or undefined when the file is
 *   unreadable or the key is absent.
 */
const readFromEnvFile = (envFilePath, key) => {
  try {
    return dotenv.parse(readFileSync(envFilePath, "utf8"))[key];
  } catch {
    return undefined;
  }
}

/**
 * Resolves every §10.4 key through the lookup chain and fails fast
 * when a Required variable is missing everywhere.
 * @returns {Object<string, string>} Fully resolved values.
 * @throws {Error} Naming every missing Required variable.
 */
const buildEnv = () => {
  dotenv.config({ path: backendEnvPath, quiet: true });

  const missing = [];
  const resolved = Object.fromEntries(
    Object.entries(ENV_SPEC).map(([key, spec]) => {
      const value = process.env[key] ?? readFromEnvFile(clientEnvPath, key);
      if (value !== undefined && value !== "") {
        return [key, value];
      }
      if (spec.default !== undefined) {
        return [key, spec.default];
      }
      missing.push(key);
      return [key, undefined];
    }),
  );

  if (missing.length > 0) {
    throw new Error(
      `Fail-fast: missing required env variables: ${missing.join(", ")}`,
    );
  }
  return resolved;
}

/**
 * The frozen configuration object — the only exported surface
 * (§10.3, ADR-020).
 * @type {Object<string, string>}
 */
export const env = Object.freeze(buildEnv());
