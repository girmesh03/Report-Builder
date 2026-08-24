/**
 * @module utils/constants
 *
 * Canonical home of every non-environment literal (§11.1). Groups are
 * added here only when their first consumer lands — never
 * speculatively (KNOWN OR AMENDED ONLY, owner directive 2026-08-24).
 */

/**
 * Deep-freezes a value so nested objects and arrays are immutable too
 * (§11.2).
 * @template T
 * @param {T} value - Value to freeze.
 * @returns {T} The same value, deeply frozen.
 */
function deepFreeze(value) {
  if (value !== null && typeof value === "object") {
    Object.values(value).forEach(deepFreeze);
  }
  return Object.freeze(value);
}

export { deepFreeze };
