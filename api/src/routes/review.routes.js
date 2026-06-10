import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getEventReviews, getUserReview, addOrUpdateReview } from "../controllers/review.controller.js"

const router = express.Router();

router.post("/review/getEventReviews", getEventReviews)
router.post("/review/getUserReview", getUserReview)
router.post("/review/add", addOrUpdateReview);
router.post("/review/update", authMiddleware, addOrUpdateReview);

export default router;
