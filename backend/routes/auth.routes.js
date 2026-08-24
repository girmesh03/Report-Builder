/**
 * @module routes/auth
 *
 * The §28.3 route surface under `/auth`, whole-router behind the
 * auth rate tier (§27.3). Chain order per §29.3: rules → validate()
 * → controller.
 */
import { Router } from "express";
import { authLimiter } from "../middleware/rateLimit.js";
import {
  registerChain,
  loginChain,
} from "../validators/user.validator.js";
import validate from "../validators/validation.js";
import {
  register,
  login,
  refresh,
  logout,
  googleStub,
} from "../controllers/auth.controller.js";

const authRoutes = Router();

authRoutes.use(authLimiter);

authRoutes.post("/register", registerChain, validate(), register);
authRoutes.post("/login", loginChain, validate(), login);
authRoutes.post("/refresh", refresh);
authRoutes.post("/logout", logout);
authRoutes.get("/google", googleStub);

export default authRoutes;
