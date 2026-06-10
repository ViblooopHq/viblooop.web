import admin from "../config/firebase.config.js";
import FCMToken from "../models/fcm.model.js";
import logger from "../utils/logger.util.js";
import { sendResponse } from "../utils/response.util.js";

async function registerFCMToken(req, res) {
    try {
        const userId = req.user.id;
        const token = req.body.fcmToken;
        const user = await FCMToken.findOne({ userId });
        if (!user) {
            const fcmToken = new FCMToken({ userId, token: [token] });
            await fcmToken.save();
            return sendResponse(res, 200, true, "Token registered successfully");
        }

        if (!user.token.includes(token)) {
            user.token.push(token);
            await user.save();
        }
        return sendResponse(res, 200, true, "Token registered successfully");
    } catch (error) {
        return sendResponse(res, 500, false, "Internal server error");
    }
}

async function deleteFCMToken(req, res) {
    try {
        const userId = req.user.id;
        const token = req.body.fcmToken;
        if (!token) { return res.status(400).json({ message: "Token is required" }); }
        const user = await FCMToken.findOne({ userId });
        if (!user) {
            return sendResponse(res, 404, false, "User not found");
        }
        user.token = user.token.filter((t) => t !== token);
        await user.save();
        return sendResponse(res, 200, true, "Token deleted successfully");

    } catch (error) {
        return sendResponse(res, 500, false, "Internal server error");
    }
}

// async function sendNotification(userId, notification, event) {
//     try {
//         const user = await FCMToken.findOne({ userId });
//         if (!user) {
//             return res.status(404).json({ message: "User not found" });
//         }
//         const message = {
//             tokens: user.token,
//             notification: notification,
//             data: {
//                 type: "EVENT_REMINDER",
//                 eventId: event._id.toString(),
//                 clickUrl: `${process.env.FRONTEND_URL}/events/${event._id}`
//             },
//             webpush: {
//                 fcm_options: {
//                     link: `${process.env.FRONTEND_URL}/events/${event._id}`
//                 }
//             }
//         };

//         await admin.messaging().sendEachForMulticast(message);
//     } catch (error) {
//         return res.status(500).json({ message: "Internal server error" });
//     }
// }

export async function sendEventReminder(userTokens, event) {

    const message = {
        tokens: userTokens,

        notification: {
            title: "Event starting soon 🎉",
            body: `${event.title} starts in 30 minutes`,
            image: event.banner
        },

        data: {
            type: "EVENT_REMINDER",
            eventId: event._id.toString(),
            clickUrl: `${process.env.FRONTEND_URL}/events/${event._id}`
        },

        webpush: {
            fcm_options: {
                link: `${process.env.FRONTEND_URL}/events/${event._id}`
            }
        }
    };

    await admin.messaging().sendEachForMulticast(message);
}

/**
 * 
 * @param {string} excludeUserId 
 * @param {string} notificationType 
 * @param {object} notification 
 * @param {object} event 
 */
async function sendNotificationToAll(excludeUserId, notificationType, notification, event) {
    try {
        const tokens = await FCMToken.find({ userId: { $ne: excludeUserId } });
        const allTokens = tokens.flatMap(t => t.token);

        if (allTokens.length === 0) return;

        const eventId = event?._id?.toString() || event?.id || "";

        const message = {
            tokens: allTokens,
            notification: notification,
            data: {
                type: (typeof notificationType === 'string' ? notificationType : "NEW_EVENT"),
                eventId: eventId,
                clickUrl: eventId ? `${process.env.FRONTEND_URL}/events/${eventId}` : process.env.FRONTEND_URL
            },
            webpush: {
                fcm_options: {
                    link: eventId ? `${process.env.FRONTEND_URL}/events/${eventId}` : process.env.FRONTEND_URL
                }
            }
        };

        const response = await admin.messaging().sendEachForMulticast(message);
        logger.info(`FCM: Bulk notification sent. Success: ${response.successCount}, Failure: ${response.failureCount}`);
    } catch (error) {
        logger.error("Error sending bulk notification:", error);
    }
}

/**
 * 
 * @param {string} userId 
 * @param {string} notificationType 
 * @param {object} notification 
 * @param {object} event 
 */
async function sendPushNotificationToUser(userId, notificationType, notification, event) {
    try {
        const tokens = await FCMToken.find({ userId });
        const allTokens = tokens.flatMap(t => t.token);

        if (allTokens.length === 0) return;

        const eventId = event?._id?.toString() || event?.id || "";

        const message = {
            tokens: allTokens,
            notification: notification,
            data: {
                type: (typeof notificationType === 'string' ? notificationType : "NEW_EVENT"),
                eventId: eventId,
                clickUrl: eventId ? `${process.env.FRONTEND_URL}/events/${eventId}` : process.env.FRONTEND_URL
            },
            webpush: {
                fcm_options: {
                    link: eventId ? `${process.env.FRONTEND_URL}/events/${eventId}` : process.env.FRONTEND_URL
                }
            }
        };

        const response = await admin.messaging().sendEachForMulticast(message);
        logger.info(`FCM: User notification sent. Success: ${response.successCount}, Failure: ${response.failureCount}`);
    } catch (error) {
        logger.error("Error sending user notification:", error);
    }
}

export { registerFCMToken, deleteFCMToken, sendNotificationToAll, sendPushNotificationToUser };