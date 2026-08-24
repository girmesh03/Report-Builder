/**
 * @module middleware/mongoSanitize
 *
 * Express-5-safe `$`/`.` operator-key stripper (§27.2): the stock
 * express-mongo-sanitize reassignment breaks on Express 5's
 * getter-only `req.query`, so keys are stripped in place instead —
 * bodies, params, and queries pass through before validation.
 */

/** Matches operator-carrying keys: a leading `$`, or any dotted path. */
const OPERATOR_KEY = /^\$|\./;

/**
 * Recursively deletes `$`/`.` keys from a plain-object tree, in place.
 * @param {unknown} value - Candidate object from the request.
 * @returns {void}
 */
const stripOperators = (value) => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    if (Array.isArray(value)) {
      value.forEach(stripOperators);
    }
    return;
  }
  Object.keys(value).forEach((key) => {
    if (OPERATOR_KEY.test(key)) {
      delete value[key];
      return;
    }
    stripOperators(value[key]);
  });
}

/**
 * Sanitizes body/params/query in place, then continues the chain.
 * @type {import("express").RequestHandler}
 */
const mongoSanitize = (req, _res, next) => {
  [req.body, req.params, req.query].forEach(stripOperators);
  next();
}

export default mongoSanitize;
