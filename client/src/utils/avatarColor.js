/**
 * @module utils/avatarColor
 *
 * Deterministic "known random" avatar coloring (A40, 2026-08-31): first-letter
 * avatars derive a stable color from an identifier (e.g. a branch name) so the
 * same entity always renders the same color across renders and reloads. No
 * per-render `Math.random()` color (AGENTS: avatar colors are deterministic).
 */

import { AVATAR_COLORS } from "./constants.js";

/**
 * FNV-1a 32-bit hash of a string — a small, stable hash for palette indexing.
 * @param {string} input - The string to hash.
 * @returns {number} The unsigned 32-bit hash.
 */
const fnv1a = (input) => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
};

/**
 * Returns the deterministic avatar background color for a seed string.
 * @param {string} seed - The identifier to color (e.g. a branch name).
 * @returns {string} A color from the frozen `AVATAR_COLORS` palette.
 */
export const getAvatarColor = (seed) => {
  if (!seed) {
    return AVATAR_COLORS[0];
  }
  return AVATAR_COLORS[fnv1a(seed) % AVATAR_COLORS.length];
};

export default getAvatarColor;
