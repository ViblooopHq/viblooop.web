import {
  getAllEvents,
  getEventsByCategory,
  createEvent,
  getEventDetails,
  deleteEvent,
  updateEvent,
  getAllEventsByUser,
  getAllAttendedEvents,
  requestJoinEvent,
  acceptJoinRequest,
  getAllEventsImagesByUser,
  getAddressFromPostal,
  rejectJoinEventRequest,
  getGeocode,
  getJoinRequestStatus,
  getRelatedEvents
} from "../../controllers/event/event.controller.js";
import { uploadEventImages } from "../../middleware/uploadEventImages.middleware.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

import express from "express";

const router = express.Router();

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Get all events
 *     tags: [Events]
 */
router.get("/getAllEvents", getAllEvents);

/**
 * @swagger
 * /api/getEventsByCategory:
 *   get:
 *     summary: Get all events by category
 *     tags: [Events]
 */
router.post("/getAllEventsByCategory", getEventsByCategory);
router.post("/getAllEventsByUser", getAllEventsByUser);
router.post("/getAllAttendedEvents", getAllAttendedEvents);
router.post("/getAllEventsImagesByUser", getAllEventsImagesByUser);
// router.post("/getAllEvents", getAllEvents);
router.post("/getEventDetails", getEventDetails);
router.post("/getJoinStatus", authMiddleware, getJoinRequestStatus);

router.post("/requestJoinEvent", authMiddleware, requestJoinEvent);
router.post("/acceptJoinRequest", authMiddleware, acceptJoinRequest);
router.post("/rejectJoinEventRequest", authMiddleware, rejectJoinEventRequest);
router.post("/createEvent", authMiddleware, uploadEventImages, createEvent);
router.post("/updateEvent", authMiddleware, uploadEventImages, updateEvent);
router.post("/deleteEvent", authMiddleware, deleteEvent);
router.post("/getAddressFromPinCode", getAddressFromPostal);
router.post("/getGeoLocation", getGeocode);
router.post("/getRelatedEvents", getRelatedEvents);



export default router;
