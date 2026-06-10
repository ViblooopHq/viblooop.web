import Notification from "../models/notification.model.js";
import logger from "../utils/logger.util.js";

/**
 * Sends a notification to a specific user room (multi-tab support via rooms).
 * @param {string} userId - The user ID to notify.
 * @param {Object} io - The socket.io server instance.
 */
export const sendSocketNotification = async (userId, io) => {
  try {
    if (io) {
      // Fetch latest 20 notifications for this user (both read and unread)
      const notifications = await Notification.find({ receiverId: userId })
        .sort({ createdAt: -1 })
        .limit(20)
        .populate("eventId", "title");

      // Emit to the room named after the userId (all tabs for this user)
      io.to(userId.toString()).emit("notifications", notifications);
      logger.info(`Real-time notifications pushed to user ${userId} room.`);
    } else {
      logger.warn(`No Socket.io server (io) provided for user ${userId}.`);
    }
  } catch (error) {
    logger.error(`Error sending socket notification to user ${userId}: ${error.message}`);
  }
};

/**
 * Fetches notifications for a user and emits them via the provided socket.
 * Used during initial connection / registration / user_online events.
 * @param {Object} socket - The Socket.io socket object.
 * @param {string} receiverId - The user ID.
 */
export const filterNotifications = async (socket, receiverId) => {
  try {
    const notifications = await Notification.find({ receiverId })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("eventId", "title");

    if (socket) {
      socket.emit("notifications", notifications);
    }
  } catch (error) {
    logger.error(`Error fetching notifications for user ${receiverId}: ${error.message}`);
    if (socket) {
      socket.emit("notifications_error", "Unable to fetch notifications");
    }
  }
};
