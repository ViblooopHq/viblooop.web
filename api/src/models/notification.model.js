import mongoose from "mongoose";
import { NOTIFICATION_TYPE } from "../constants/constant.js";

const notificationSchema = new mongoose.Schema({
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Events" },
  senderName: { type: String },
  senderImage: { type: String },
  message: { type: String, required: true },
  type: { type: String, default: NOTIFICATION_TYPE.SYSTEM },
  status: { type: String }, // For actions like accepted/rejected
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

notificationSchema.index({ receiverId: 1, read: 1 });

export default mongoose.model("Notification", notificationSchema);