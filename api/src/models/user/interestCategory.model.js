import mongoose from "mongoose";

const tagSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true },
    icon: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true }
  },
  { _id: true }
);

const interestCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    tags: [tagSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("InterestCategory", interestCategorySchema);
