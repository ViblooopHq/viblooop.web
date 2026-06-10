import Notification from "../models/notification.model.js";
import { filterNotifications, sendSocketNotification } from "../services/notification.service.js";
import logger from "../utils/logger.util.js";

export const initSocket = (io) => {
  io.on("connection", (socket) => {
    logger.info(`⚡ New client connected: ${socket.id}`);

    /**
     * Standardized User Registration
     * Joins the user to their own private room for targeted notifications.
     */
    const registerUser = (userId) => {
      if (userId) {
        const idStr = userId.toString();
        
        // Safeguard: Leave all existing user rooms before joining a new one
        // This prevents a socket from receiving notifications for multiple users 
        // if the session changed without a disconnect.
        socket.rooms.forEach((room) => {
          if (room !== socket.id && room !== idStr) {
            socket.leave(room);
          }
        });

        socket.join(idStr);
        logger.info(`Socket ${socket.id} joined room for user ${userId}`);
        // Send to all tabs for this user to ensure consistency
        sendSocketNotification(userId, io);
      }
    };

    socket.on("register", registerUser);
    socket.on("user_online", registerUser);

    socket.on("disconnect", () => {
      logger.info(`⚡ Client disconnected: ${socket.id}`);
    });

    socket.on("mark_as_read", async (userId, notificationIds) => {
      try {
        // Support both single ID (string) and multiple IDs (array)
        const ids = Array.isArray(notificationIds) ? notificationIds : [notificationIds];
        
        await Notification.updateMany(
          { receiverId: userId, _id: { $in: ids } },
          { $set: { read: true } }
        );
        // Sync all tabs for this user
        sendSocketNotification(userId, io);
      } catch (error) {
        logger.error(`Error marking notifications as read for ${userId}: ${error.message}`);
      }
    });

    socket.on("mark_all_read", async (userId) => {
      try {
        await Notification.updateMany(
          { receiverId: userId, read: false },
          { $set: { read: true } }
        );
        // Sync all tabs for this user
        sendSocketNotification(userId, io);
      } catch (error) {
        logger.error(`Error marking all notifications as read for ${userId}: ${error.message}`);
      }
    });
  });
};
