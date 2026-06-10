import express from "express";
import {
  updateUserProfile,
  verifySelfieProfile,
  getUserProfile,
  updatePassword,
  getAvailableEventLimit,
  getAttendeesDetails,
  getAllInterests,
  toggleWishlistEvent,
  getWishlistedEvents,
  deactivateAccount
} from "../controllers/user.controller.js";
import { uploadProfileImages } from "../middleware/uploadUserProfile.middleware.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/updateProfile", authMiddleware, uploadProfileImages, updateUserProfile);
router.post("/verifySelfieProfile", authMiddleware, uploadProfileImages, verifySelfieProfile);
router.post("/getUserProfile", authMiddleware, getUserProfile);
router.post("/getAvailableEventLimit", getAvailableEventLimit);
router.post("/updatePassword", authMiddleware, updatePassword);
router.post("/getAttendeeDetails", getAttendeesDetails);
router.post("/toggleWishlistEvent", authMiddleware, toggleWishlistEvent);
router.get("/getWishlistedEvents", authMiddleware, getWishlistedEvents);
router.get("/getAllInterests", getAllInterests);
router.post("/deactivate-account", authMiddleware, deactivateAccount);

export default router;
