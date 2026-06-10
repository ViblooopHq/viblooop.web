import express from "express"
import { registerFCMToken, deleteFCMToken } from "../controllers/fcm.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register-fcm-token", authMiddleware, registerFCMToken);
// router.post("/delete-fcm-token", authMiddleware, deleteFCMToken);

export default router;