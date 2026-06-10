import Message from "../models/message.model.js";
import EventModel from "../models/event/event.model.js";
import ChatReadState from "../models/chatReadState.model.js";
import logger from "../utils/logger.util.js";
import mongoose from "mongoose";

const HISTORY_LIMIT = 50;

const getMemberEventQuery = (userId) => {
  const userIdString = userId.toString();
  const objectId = mongoose.isValidObjectId(userIdString)
    ? new mongoose.Types.ObjectId(userIdString)
    : userIdString;

  return {
    $or: [
      { createdBy: objectId },
      { attendees: objectId },
      {
        $expr: {
          $in: [
            userIdString,
            {
              $map: {
                input: "$attendees",
                as: "attendee",
                in: { $toString: "$$attendee" },
              },
            },
          ],
        },
      },
    ],
  };
};

/**
 * Checks if a user is an attendee or the creator of an event.
 */
const isAuthorized = async (eventId, userId) => {
  const event = await EventModel.findById(eventId).select(
    "attendees createdBy"
  );
  if (!event) return false;

  const isCreator = event.createdBy.toString() === userId.toString();
  const isAttendee = event.attendees.some(
    (a) => a.toString() === userId.toString()
  );
  return isCreator || isAttendee;
};

/**
 * Updates the last read timestamp for a user in an event.
 */
const markAsRead = async (eventId, userId) => {
  try {
    await ChatReadState.findOneAndUpdate(
      { userId, eventId },
      { lastReadAt: new Date() },
      { upsert: true, new: true }
    );
  } catch (error) {
    logger.error(`Error marking as read: ${error.message}`);
  }
};

/**
 * Calculates total unread messages across all events for a user.
 */
const getUnreadTotal = async (userId) => {
  try {
    const events = await EventModel.find(getMemberEventQuery(userId)).select("_id");

    let total = 0;
    for (const event of events) {
      const readState = await ChatReadState.findOne({ userId, eventId: event._id });
      const lastReadAt = readState ? readState.lastReadAt : new Date(0);
      
      const unreadCount = await Message.countDocuments({
        eventId: event._id,
        createdAt: { $gt: lastReadAt },
        senderId: { $ne: userId } // Don't count own messages
      });
      total += unreadCount;
    }
    return total;
  } catch (error) {
    logger.error(`Error getting unread total: ${error.message}`);
    return 0;
  }
};

export const initChatSocket = (io) => {
  io.on("connection", (socket) => {
    /**
     * Join all authorized event rooms on registration.
     */
    socket.on("register", async (userId) => {
      try {
        if (!userId) return;

        const events = await EventModel.find(getMemberEventQuery(userId)).select("_id");

        events.forEach((event) => {
          socket.join(`event:${event._id}`);
        });

        // Emit initial unread total
        const unreadTotal = await getUnreadTotal(userId);
        socket.emit("chat:unread_total", unreadTotal);

        logger.info(
          `Socket ${socket.id} auto-joined ${events.length} chat rooms for user ${userId}`
        );
      } catch (error) {
        logger.error(`Error auto-joining chat rooms: ${error.message}`);
      }
    });

    /**
     * Fetch conversation list (Inbox) with unread counts
     */
    socket.on("chat:get_inbox", async (userId) => {
      try {
        if (!userId) return;

        const events = await EventModel.find(getMemberEventQuery(userId))
          .select("title image createdBy attendees")
          .lean();

        const inbox = await Promise.all(
          events.map(async (event) => {
            const lastMessage = await Message.findOne({ eventId: event._id })
              .sort({ createdAt: -1 })
              .lean();

            const readState = await ChatReadState.findOne({ userId, eventId: event._id });
            const lastReadAt = readState ? readState.lastReadAt : new Date(0);

            const unreadCount = await Message.countDocuments({
              eventId: event._id,
              createdAt: { $gt: lastReadAt },
              senderId: { $ne: userId }
            });

            return {
              eventId: event._id,
              title: event.title,
              image: event.image,
              memberCount: new Set([
                event.createdBy?.toString(),
                ...(event.attendees || []).map((attendee) => attendee.toString()),
              ].filter(Boolean)).size,
              lastMessage: lastMessage || null,
              unreadCount
            };
          })
        );

        inbox.sort((a, b) => {
          const dateA = a.lastMessage ? new Date(a.lastMessage.createdAt) : new Date(0);
          const dateB = b.lastMessage ? new Date(b.lastMessage.createdAt) : new Date(0);
          return dateB - dateA;
        });

        socket.emit("chat:inbox", inbox);
      } catch (error) {
        logger.error(`chat:get_inbox error: ${error.message}`);
      }
    });

    /**
     * Join an event chat room and mark as read.
     */
    socket.on("chat:join", async ({ eventId, userId }) => {
      try {
        if (!eventId || !userId) return;

        const authorized = await isAuthorized(eventId, userId);
        if (!authorized) {
          socket.emit("chat:error", "You are not authorized to join this chat.");
          return;
        }

        const roomName = `event:${eventId}`;
        socket.join(roomName);
        
        // Mark as read when joining
        await markAsRead(eventId, userId);
        const unreadTotal = await getUnreadTotal(userId);
        socket.emit("chat:unread_total", unreadTotal);

        // Send last N messages as history
        const history = await Message.find({ eventId })
          .sort({ createdAt: -1 })
          .limit(HISTORY_LIMIT)
          .lean();

        socket.emit("chat:history", {
          eventId: eventId.toString(),
          messages: history.reverse(),
        });
      } catch (error) {
        logger.error(`chat:join error: ${error.message}`);
        socket.emit("chat:error", "Failed to join chat room.");
      }
    });

    /**
     * Explicit mark as read (used for active chat window)
     */
    socket.on("chat:mark_read", async ({ eventId, userId }) => {
      if (!eventId || !userId) return;
      await markAsRead(eventId, userId);
      const unreadTotal = await getUnreadTotal(userId);
      socket.emit("chat:unread_total", unreadTotal);
    });
    socket.on(
      "chat:message",
      async ({ eventId, senderId, senderName, senderImage, text }) => {
        try {
          if (!eventId || !senderId || !text?.trim()) return;

          const roomName = `event:${eventId}`;

          // Persist the message
          const message = await Message.create({
            eventId,
            senderId,
            senderName,
            senderImage: senderImage || "",
            text: text.trim(),
          });

          // Broadcast to all members of the room
          io.to(roomName).emit("chat:message", {
            _id: message._id,
            eventId: message.eventId,
            senderId: message.senderId,
            senderName: message.senderName,
            senderImage: message.senderImage,
            text: message.text,
            createdAt: message.createdAt,
          });
        } catch (error) {
          logger.error(`chat:message error: ${error.message}`);
        }
      }
    );

    /**
     * Leave an event chat room.
     */
    socket.on("chat:leave", ({ eventId }) => {
      if (!eventId) return;
      const roomName = `event:${eventId}`;
      socket.leave(roomName);
      logger.info(`Socket ${socket.id} left chat room ${roomName}`);
    });
  });
};
