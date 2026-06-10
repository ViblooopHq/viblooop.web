import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Events",
      required: true,
    },
    ratedUserId: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    raterUserId: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    score: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Ensure one review per user per event
reviewSchema.index({ eventId: 1, raterUserId: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);
