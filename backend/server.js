/**
 * @module server
 *
 * P1 boot prototype (§66.9): importing `config/env.js` proves the
 * fail-fast contract — a missing Required variable throws here and
 * the process exits non-zero. Superseded by the §26 foundation when
 * the auth slice opens.
 */
import { env } from "./config/env.js";

/**
 * Verifies the frozen-env invariant and ends quietly on success.
 * @returns {void}
 */
function main() {
  if (!Object.isFrozen(env)) {
    throw new Error("env object must be frozen");
  }
}

main();
