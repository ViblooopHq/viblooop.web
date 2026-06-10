import axios from "axios";
import Events from "../../models/event/event.model.js";
import User from "../../models/user/user.model.js";
import { sendResponse } from "../../utils/response.util.js";
import { cleanupFiles } from "../../utils/deleteFile.util.js";
import NodeGeocoder from 'node-geocoder';
import { sendNotificationToAll, sendPushNotificationToUser } from "../fcm.controller.js";
import PendingJoinRequest from "../../models/event/pendingJoinRequest.model.js";
import { NOTIFICATION_TYPE, PENDING_JOIN_REQUEST_STATUS } from "../../constants/constant.js";
import { sendSocketNotification } from "../../services/notification.service.js";
import logger from "../../utils/logger.util.js";
import Notification from "../../models/notification.model.js";

const options = {
  provider: "openstreetmap",
  formatter: null,
  fetch: undefined,
  apiKey: null,
  requestOptions: {
    headers: {
      "User-Agent": "Viblooop/1.0 (support@viblooop.com)"
    }
  }
};

const geocoder = NodeGeocoder(options);


export async function createEvent(req, res) {
  const imageFile = req.files?.image?.[0];
  const galleryFiles = req.files?.gallery ?? [];

  try {
    const createdBy = req.user.id;
    const user = await User.findById(createdBy);

    if (!createdBy) {
      await cleanupFiles([imageFile.path, ...galleryFiles.map((f) => f.path)]);
      return sendResponse(res, 400, false, "User not found");
    }

    if (!imageFile) {
      await cleanupFiles(galleryFiles.map((f) => f.path));
      return sendResponse(res, 400, false, "Main event image is required");
    }

    let {
      title,
      description,
      eventDate,
      endDate,
      eventTime,
      address,
      attendeeLimit,
      audiencePreference = "open",
      attendeeMix = 50,
      tags,
      category,
      cost,
      price
    } = req.body;
    address = JSON.parse(address);

    if (!title || !description || !eventDate || !eventTime || !address || !category) {
      await cleanupFiles([imageFile.path, ...galleryFiles.map((f) => f.path)]);
      return sendResponse(res, 400, false, "Missing required fields");
    }

    const imagePath = imageFile.path;
    const galleryPaths = galleryFiles.map((file) => file.path);
    const normalizedAudiencePreference = ["open", "women", "men"].includes(audiencePreference)
      ? audiencePreference
      : "open";
    const normalizedAttendeeMix = Math.min(100, Math.max(0, Number(attendeeMix) || 50));

    if (user.eventCount >= user.eventLimit) {
      await cleanupFiles([imageFile.path, ...galleryFiles.map((f) => f.path)]);
      return sendResponse(res, 400, false, "You have reached your event limit");
    }

    const newEvent = new Events({
      title,
      description,
      image: imagePath,
      eventDate,
      endDate,
      eventTime,
      address,
      attendeeLimit,
      audiencePreference: normalizedAudiencePreference,
      attendeeMix: normalizedAttendeeMix,
      tags,
      category,
      createdBy,
      gallery: galleryPaths,
      cost,
      price,
    });

    await newEvent.save();

    user.eventCount += 1;
    await user.save();

    // Send background notification
    sendNotificationToAll(createdBy, NOTIFICATION_TYPE.NEW_EVENT, {
      title: "New Event Created! 🚀",
      body: `${user.username} created a new event: ${title}`,
      image: imagePath
    }, newEvent);

    return sendResponse(res, 201, true, "Event created successfully", {
      event: newEvent,
    });
  } catch (error) {
    const allFiles = [];
    if (imageFile) allFiles.push(imageFile.path);
    if (galleryFiles.length) allFiles.push(...galleryFiles.map((f) => f.path));
    await cleanupFiles(allFiles);
    return sendResponse(res, 500, false, error.message || "Internal Server Error");
  }
}

export async function updateEvent(req, res) {
  const eventId = req.body.eventId;
  const imageFile = req.files?.image?.[0];
  const newGalleryFiles = req.files?.gallery ?? [];

  try {
    const event = await Events.findById(eventId);
    if (!event) {
      await cleanupFiles([
        ...(imageFile ? [imageFile.path] : []),
        ...newGalleryFiles.map(f => f.path),
      ]);
      return sendResponse(res, 404, false, "Event not found");
    }

    let {
      title,
      description,
      eventDate,
      endDate,
      eventTime,
      address,
      attendeeLimit,
      audiencePreference,
      attendeeMix,
      tags,
      category,
      cost,
      price,
      removedGallery = []
    } = req.body;
    address = JSON.parse(address);

    if (imageFile) {
      if (event.image) await cleanupFiles([event.image]);
      event.image = imageFile.path;
    }

    if (removedGallery.length > 0) {
      const removedPaths = Array.isArray(removedGallery)
        ? removedGallery
        : [removedGallery];
      await cleanupFiles(removedPaths);
      event.gallery = event.gallery.filter(path => !removedPaths.includes(path));
    }

    if (newGalleryFiles.length > 0) {
      const newPaths = newGalleryFiles.map(f => f.path);
      event.gallery.push(...newPaths);
    }

    if (title) event.title = title;
    if (description) event.description = description;
    if (eventDate) event.eventDate = eventDate;
    if (endDate) event.endDate = endDate;
    if (eventTime) event.eventTime = eventTime;
    if (address) event.address = address;
    if (attendeeLimit) event.attendeeLimit = attendeeLimit;
    if (audiencePreference && ["open", "women", "men"].includes(audiencePreference)) event.audiencePreference = audiencePreference;
    if (attendeeMix !== undefined) event.attendeeMix = Math.min(100, Math.max(0, Number(attendeeMix) || 50));
    if (tags) event.tags = tags;
    if (category) event.category = category;
    if (cost) event.cost = cost;
    if (price !== undefined) event.price = price;

    await event.save();

    return sendResponse(res, 200, true, "Event updated successfully", {
      event,
    });
  } catch (error) {
    const allFiles = [];
    if (imageFile) allFiles.push(imageFile.path);
    if (newGalleryFiles.length) allFiles.push(...newGalleryFiles.map(f => f.path));

    await cleanupFiles(allFiles);

    console.error(error);
    return sendResponse(res, 500, false, "Failed to update event", null, error.message);
  }
}

export async function deleteEvent(req, res) {
  try {
    const eventId = req.body.eventId;

    const event = await Events.findById(eventId);
    if (!event) {
      return sendResponse(res, 404, false, "Event not found");
    }

    await cleanupFiles([event.image, ...event.gallery]);

    await Events.findByIdAndDelete(eventId);

    // Decrement user event count
    await User.findByIdAndUpdate(event.createdBy, { $inc: { eventCount: -1 } });

    return sendResponse(res, 200, true, "Event deleted successfully");
  } catch (e) {
    return sendResponse(res, 500, false, e.message || "Internal Server Error");
  }
}

export async function getEventDetails(req, res) {
  try {
    const eventId = req.body.eventId;

    let event = await Events.findById(eventId)
      .populate('createdBy', 'username email profileImage averageRating totalRatings eventCount bio')
      .populate('category', 'title');

    if (!event) {
      return sendResponse(res, 404, false, "No Event Found");
    }

    return sendResponse(res, 200, true, "Event fetched successfully", event);
  } catch (e) {
    return sendResponse(res, 500, false, e.message || "Internal Server Error");
  }
}

export async function getEventsByCategory(req, res) {
  try {
    const events = await Events.find({ category: req.body.category })
      .populate('createdBy', 'username email profileImage')
      .populate('category', 'title')
      .populate('attendees', 'username profileImage');

    if (!events) {
      return sendResponse(res, 404, false, "No Events Found");
    }

    return sendResponse(res, 200, true, "Events fetched successfully", events);
  } catch (e) {
    return sendResponse(res, 500, false, e.message || "Internal Server Error");
  }
}

/**
 * Gets the current join request status for a user and an event.
 */
export async function getJoinRequestStatus(req, res) {
  try {
    const { eventId, userId } = req.body;

    const joinRequest = await PendingJoinRequest.findOne({ eventId, userId });

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Join request status fetched successfully",
      data: {
        status: joinRequest ? joinRequest.status : null
      }
    });
  } catch (e) {
    return sendResponse(res, 500, false, e.message || "Internal Server Error");
  }
}

export async function getAllEvents(req, res) {
  try {
    const events = await Events.find({})
      .populate('createdBy', 'username email profileImage averageRating')
      .populate('category', 'title')
      .populate('attendees', 'username profileImage');

    if (!events) {
      return sendResponse(res, 404, false, "No Events Found");
    }

    return sendResponse(res, 200, true, "Events fetched successfully", events);
  } catch (e) {
    return sendResponse(res, 500, false, e.message || "Internal Server Error");
  }
}

export async function getAllEventsByUser(req, res) {
  try {
    const userId = req.body.userId;

    const events = await Events.find({ createdBy: userId })
      .populate('createdBy', 'username email profileImage')
      .populate('category', 'title')
      .populate('attendees', 'username profileImage');

    if (!events) {
      return sendResponse(res, 404, false, "No Events Found");
    }

    return sendResponse(res, 200, true, "Events fetched successfully", events);
  } catch (e) {
    return sendResponse(res, 500, false, e.message || "Internal Server Error");
  }
}

export async function getAllAttendedEvents(req, res) {
  try {
    const userId = req.body.userId;

    const events = await Events.find({ attendees: userId })
      .populate('createdBy', 'username email profileImage')
      .populate('category', 'title')
      .populate('attendees', 'username profileImage');

    if (!events) {
      return sendResponse(res, 404, false, "No Events Found");
    }

    return sendResponse(res, 200, true, "Events fetched successfully", events);
  } catch (e) {
    return sendResponse(res, 500, false, e.message || "Internal Server Error");
  }
}

export async function getAllEventsImagesByUser(req, res) {
  try {
    const userId = req.body.userId;

    const events = await Events.find({ createdBy: userId });

    if (!events) {
      return sendResponse(res, 404, false, "No Events Found");
    }

    const galleryImages = events.flatMap((event) => {
      return {
        event: event.title,
        gallery: event.gallery
      }
    });

    if (!galleryImages) {
      return sendResponse(res, 404, false, "No Events Found");
    }

    console.log(galleryImages);

    return sendResponse(res, 200, true, "Images fetched successfully", galleryImages);
  } catch (e) {
    return sendResponse(res, 500, false, e.message || "Internal Server Error");
  }
}

export async function requestJoinEvent(req, res) {
  try {
    const { eventId } = req.body;
    const userId = req.user.id;

    const event = await Events.findById(eventId);
    if (!event) {
      return sendResponse(res, 404, false, "Requested event not found");
    }

    if (event.attendees.length >= event.attendeeLimit) {
      return sendResponse(res, 400, false, "Requested event is full");
    }

    if (event.attendees.includes(userId)) {
      return sendResponse(res, 400, false, "You have already joined this event");
    }

    const user = await User.findById(userId);
    if (!user) {
      return sendResponse(res, 404, false, "User not found");
    }

    // Prevent duplicate join requests, but allow re-applying if previously rejected
    let existingRequest = await PendingJoinRequest.findOne({ eventId, userId });
    if (existingRequest) {
      if (existingRequest.status === PENDING_JOIN_REQUEST_STATUS.REJECTED) {
        existingRequest.status = PENDING_JOIN_REQUEST_STATUS.PENDING;
        await existingRequest.save();
      } else {
        return sendResponse(res, 400, false, `You have already sent a join request for this event (Status: ${existingRequest.status})`);
      }
    } else {
      // Store the request into Pending Join Collection
      const pendingJoinRequest = new PendingJoinRequest({
        eventId,
        userId
      });
      await pendingJoinRequest.save();
    }


    // Create Socket Notification
    const notification = new Notification({
      receiverId: event.createdBy,
      type: NOTIFICATION_TYPE.JOIN_REQUEST,
      eventId: eventId,
      senderId: userId,
      senderName: user.username,
      senderImage: user.profileImage,
      message: `${user.username} has requested to join your event`,
    });

    await notification.save();

    // Send Socket Notification
    sendSocketNotification(event.createdBy, req.app.get("io"));

    // Send FCM Notification
    sendPushNotificationToUser(event.createdBy, NOTIFICATION_TYPE.JOIN_REQUEST, {
      title: "New Join Request",
      body: `${user.username} has requested to join your event`
    }, event);

    return sendResponse(res, 200, true, "Event join request sent successfully");
  } catch (e) {
    return sendResponse(res, 500, false, e.message || "Internal Server Error");
  }
}

export async function acceptJoinRequest(req, res) {
  try {
    const { userId, eventId } = req.body;

    const event = await Events.findById(eventId).populate('createdBy', 'username profileImage');
    if (!event) {
      return sendResponse(res, 404, false, "Requested event not found");
    }

    const user = await User.findById(userId);
    if (!user) {
      return sendResponse(res, 404, false, "User not found");
    }

    // Update status only if it is currently pending
    const pendingJoinRequest = await PendingJoinRequest.findOneAndUpdate({
      eventId,
      userId,
      status: PENDING_JOIN_REQUEST_STATUS.PENDING
    }, {
      $set: {
        status: PENDING_JOIN_REQUEST_STATUS.ACCEPTED
      }
    });

    if (!pendingJoinRequest) {
      return sendResponse(res, 400, false, "Join request not found or already processed");
    }

    // Add user to the event atomically (prevent duplicates)
    await Events.findByIdAndUpdate(eventId, {
      $addToSet: { attendees: userId }
    });

    // mark the previous notification as read
    await Notification.findOneAndUpdate(
      {
        receiverId: event.createdBy._id,
        senderId: userId,
        eventId: eventId,
        type: NOTIFICATION_TYPE.JOIN_REQUEST,
      },
      { $set: { read: true, status: PENDING_JOIN_REQUEST_STATUS.ACCEPTED } }
    );

    // Send Join Request Accepted Socket Notification
    const notification = new Notification({
      receiverId: userId,
      type: NOTIFICATION_TYPE.JOIN_REQUEST_ACCEPTED,
      eventId: eventId,
      senderId: event.createdBy._id,
      senderName: event.createdBy.username,
      senderImage: event.createdBy.profileImage,
      message: `${event.createdBy.username} has accepted your request to join the event`,
    });

    await notification.save();

    // Send Socket Notification to both guest and host
    sendSocketNotification(userId, req.app.get("io")); // Guest notified they were accepted
    sendSocketNotification(event.createdBy._id, req.app.get("io")); // Host UI refreshed (notification marked read)

    // Send FCM Notification
    sendPushNotificationToUser(userId, NOTIFICATION_TYPE.JOIN_REQUEST_ACCEPTED, {
      title: "Join Request Accepted",
      body: `${event.createdBy.username} has accepted your request to join the event`
    }, event);

    return sendResponse(res, 200, true, "Event join request accepted successfully");
  } catch (e) {
    return sendResponse(res, 500, false, e.message || "Internal Server Error");
  }
}

export async function rejectJoinEventRequest(req, res) {
  try {
    const { userId, eventId } = req.body;

    const event = await Events.findById(eventId).populate('createdBy', 'username profileImage');
    if (!event) {
      return sendResponse(res, 404, false, "Requested event not found");
    }

    const user = await User.findById(userId);
    if (!user) {
      return sendResponse(res, 404, false, "User not found");
    }

    // Update status only if it is currently pending
    const pendingJoinRequest = await PendingJoinRequest.findOneAndUpdate({
      eventId,
      userId,
      status: PENDING_JOIN_REQUEST_STATUS.PENDING
    }, {
      $set: {
        status: PENDING_JOIN_REQUEST_STATUS.REJECTED
      }
    });

    if (!pendingJoinRequest) {
      return sendResponse(res, 400, false, "Join request not found or already processed");
    }

    // mark the previous notification as read
    await Notification.findOneAndUpdate(
      {
        receiverId: event.createdBy._id,
        senderId: userId,
        eventId: eventId,
        type: NOTIFICATION_TYPE.JOIN_REQUEST,
      },
      { $set: { read: true, status: PENDING_JOIN_REQUEST_STATUS.REJECTED } }
    );

    // Send Join Request Rejected Socket Notification
    const notification = new Notification({
      receiverId: userId,
      type: NOTIFICATION_TYPE.JOIN_REQUEST_REJECTED,
      eventId: eventId,
      senderId: event.createdBy._id,
      senderName: event.createdBy.username,
      senderImage: event.createdBy.profileImage,
      message: `${event.createdBy.username} has rejected your request to join the event`,
    });

    await notification.save();

    // Send Socket Notification to both guest and host
    sendSocketNotification(userId, req.app.get("io")); // Guest notified they were rejected
    sendSocketNotification(event.createdBy._id, req.app.get("io")); // Host UI refreshed (notification marked read)

    // Send FCM Notification
    sendPushNotificationToUser(userId, NOTIFICATION_TYPE.JOIN_REQUEST_REJECTED, {
      title: "Join Request Rejected",
      body: `${event.createdBy.username} has rejected your request to join the event`
    }, event);

    return sendResponse(res, 200, true, "Event join request rejected successfully");
  } catch (e) {
    return sendResponse(res, 500, false, e.message || "Internal Server Error");
  }
}

export async function leaveEvent(req, res) {

}

export async function getAddressFromPostal(req, res) {
  const { postalCode } = req.body;

  try {
    const response = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: {
        postalcode: postalCode,
        countrycodes: "in",
        format: "json",
        addressdetails: 1,
      },
      headers: {
        "User-Agent": "Viblooop/1.0 (support@viblooop.com)"
      }
    });

    const data = response.data;
    console.log(response);

    if (Array.isArray(data) && data.length > 0) {
      const addr = data[0].address || {};

      console.log(addr);
      return res.json({
        success: true,
        message: "Address found",
        data: {
          area: addr.village || addr.suburb || addr.town || addr.municipality || "",
          city: addr.city || addr.state_district || addr.county || "",
          state: addr.state || "",
          country: addr.country || "",
        }
      });
    } else {
      return res.status(200).json({
        success: false,
        message: "No address found",
        data: null
      });
    }
  } catch (error) {
    console.error("Error fetching postal address:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch address",
      error: error.message
    });
  }
}

export async function getGeocode(req, res) {
  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({ error: "Address is required" });
    }

    const geoResponse = await geocoder.geocode(address);

    if (geoResponse && geoResponse.length > 0) {
      return res.json({
        success: true,
        data: {
          latitude: geoResponse[0].latitude,
          longitude: geoResponse[0].longitude,
          formattedAddress: geoResponse[0].formattedAddress,
          city: geoResponse[0].city,
          state: geoResponse[0].state,
          country: geoResponse[0].country,
          zipcode: geoResponse[0].zipcode,
        },
      });
    } else {
      return res.status(200).json({ success: false, message: "No results found" });
    }
  } catch (error) {
    console.error("Geocoding failed:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getRelatedEvents(req, res) {
  try {
    const { eventId } = req.body;

    const event = await Events.findById(eventId);
    if (!event) {
      return sendResponse(res, 404, false, "Event not found");
    }

    const relatedEvents = await Events.find({
      category: event.category,
      _id: { $ne: eventId },
    }).populate('createdBy', 'username email profileImage')
      .sort({ createdAt: -1 })
      .limit(10);

    return sendResponse(res, 200, true, "Related events fetched successfully", relatedEvents);
  } catch (error) {
    return sendResponse(res, 500, false, error.message || "Internal Server Error");
  }
}
