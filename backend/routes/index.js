/**
 * @module routes/index
 *
 * The single route registry (§26.5): health lives here; every domain
 * router joins in its owning slice. `app.js` performs exactly one
 * mount of this router under `/api/v1`.
 */
import { Router } from "express";
import { HTTP_STATUS } from "../utils/httpStatus.js";
import authRoutes from "./auth.routes.js";
import branchRoutes from "./branch.routes.js";

const routes = Router();

routes.get("/health", (_req, res) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "OK",
    data: { status: "up", uptime: process.uptime() },
  });
});

routes.use("/auth", authRoutes);
routes.use("/branches", branchRoutes);

export default routes;
