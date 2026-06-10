import { Router } from "express";
import userRoutes from "./user.routes.js";
import tagsRoutes from "./tags.routes.js";
import categoryRoutes from "./event/category.routes.js";
import eventRoutes from "./event/event.routes.js";
import reviewRoutes from "./review.routes.js";
import fcmRoutes from "./fcm.routes.js";
import healthRoutes from "./health.routes.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/", userRoutes);
router.use("/", tagsRoutes);
router.use("/", categoryRoutes);
router.use("/", eventRoutes);
router.use("/", reviewRoutes);
router.use("/", fcmRoutes);

export default router;
