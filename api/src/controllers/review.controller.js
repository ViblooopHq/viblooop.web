import User from "../models/user/user.model.js";
import Event from "../models/event/event.model.js";
import Review from "../models/review.model.js";
import Notification from "../models/notification.model.js";
import mongoose from "mongoose";
import { sendResponse } from "../utils/response.util.js";
import { sendSocketNotification } from "../services/notification.service.js";
import { NOTIFICATION_TYPE } from "../constants/constant.js";

export const addOrUpdateReview = async (req, res) => {
  const { eventId, score, comment, raterUserId } = req.body;

  try {
    // 1. Ensure user is an attendee
    const event = await Event.findById(eventId);
    if (!event) {
      return sendResponse(res, 404, false, "Event not found");
    }

    const isAttendee = event.attendees && event.attendees.some(id => id.toString() === raterUserId.toString());
    
    if (!isAttendee) {
      return sendResponse(res, 403, false, "Only attendees can rate an event");
    }

    // 2. Upsert review
    const review = await Review.findOneAndUpdate(
      { eventId, raterUserId },
      { score, comment, ratedUserId: event.createdBy },
      { new: true, upsert: true }
    );

    // 3. Recalculate event ratings
    const eventAgg = await Review.aggregate([
      { $match: { eventId: event._id } },
      { $group: { _id: null, avg: { $avg: "$score" }, count: { $sum: 1 } } },
    ]);

    if (eventAgg.length > 0) {
      await Event.findByIdAndUpdate(event._id, {
        averageRating: eventAgg[0].avg,
        totalRatings: eventAgg[0].count,
      });
    }

    // 4. Recalculate user ratings (event creator)
    const userAgg = await Review.aggregate([
      { $match: { ratedUserId: event.createdBy } },
      { $group: { _id: null, avg: { $avg: "$score" }, count: { $sum: 1 } } },
    ]);

    if (userAgg.length > 0) {
      await User.findByIdAndUpdate(event.createdBy, {
        averageRating: userAgg[0].avg,
        totalRatings: userAgg[0].count,
      });
    }

    // Create notification in DB
    if (event.createdBy !== raterUserId) {
      const sender = await User.findById(raterUserId).select(
        "username profileImage"
      );

      const notification = await Notification.findOneAndUpdate(
        {
          receiverId: event.createdBy,
          senderId: raterUserId,
          eventId: event._id,
          type: NOTIFICATION_TYPE.REVIEW,
        },
        {
          $set: {
            senderName: sender.username,
            senderImage: sender.profileImage,
            message: `${sender.username} reviewed your event "${event.title}" with ${score} stars.`,
            read: false,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      sendSocketNotification(event.createdBy, req.app.get("io"));
    }

    return sendResponse(res, 200, true, "Review added/updated successfully", review);
  } catch (err) {
    return sendResponse(res, 500, false, err.message || "Internal Server Error");
  }
};

export const getEventReviews = async (req, res) => {
  try {
    const eventId = req.body.eventId;
    const reviews = await Review.find({ eventId }).populate(
      "raterUserId",
      "username profileImage"
    );
    return sendResponse(
      res,
      200,
      true,
      "Reviews fetched successfully",
      reviews
    );
  } catch (err) {
    return sendResponse(
      res,
      500,
      false,
      err.message || "Internal Server Error"
    );
  }
};

export const getUserReview = async (req, res) => {
  try {
    const userId = req.body.userId || req.user?.id;

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return sendResponse(res, 400, false, "Valid userId is required");
    }

    const ratedUserObjectId = new mongoose.Types.ObjectId(userId);

    const [reviews, ratingAgg] = await Promise.all([
      Review.find({ ratedUserId: userId })
        .sort({ score: -1, createdAt: -1 })
        .limit(5)
        .populate("raterUserId", "username profileImage")
        .populate("eventId", "title image eventDate")
        .lean(),
      Review.aggregate([
        { $match: { ratedUserId: ratedUserObjectId } },
        { $group: { _id: null, avg: { $avg: "$score" }, count: { $sum: 1 } } },
      ]),
    ]);

    const ratingSummary = ratingAgg[0] || { avg: 0, count: 0 };

    return sendResponse(res, 200, true, "User reviews fetched successfully", {
      reviews,
      averageRating: ratingSummary.avg,
      totalRatings: ratingSummary.count,
    });
  } catch (err) {
    return sendResponse(
      res,
      500,
      false,
      err.message || "Internal Server Error"
    );
  }
};
