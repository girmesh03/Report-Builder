/**
 * @module validators/user
 *
 * The §28/§29 rule chains of the auth surface. Names are never
 * accepted from the client (§19.2 derivation); the email is
 * normalized with Gmail dots preserved so account identity stays
 * dot-exact (§19.2).
 */
import { body } from "express-validator";

/** Register: exact contract fields only — email + password. */
export const registerChain = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Enter a valid email address")
    .normalizeEmail({ gmail_remove_dots: false }),
  body("password")
    .isString()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  body("firstName").not().exists(),
  body("lastName").not().exists(),
];

/** Login: presence + shape only — wrong credentials are a 401, not a 422. */
export const loginChain = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Enter a valid email address")
    .normalizeEmail({ gmail_remove_dots: false }),
  body("password").isString().notEmpty(),
];

export default { registerChain, loginChain };
