import mongoose from "mongoose";

const chatReadStateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Events",
    required: true,
  },
  lastReadAt: {
    type: Date,
    default: Date.now,
  },
});

// Unique index to ensure one record per user-event pair
chatReadStateSchema.index({ userId: 1, eventId: 1 }, { unique: true });

export default mongoose.model("ChatReadState", chatReadStateSchema);
