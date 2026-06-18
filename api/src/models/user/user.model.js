import mongoose from "mongoose";

const userInterestSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InterestCategory",
      required: true
    },
    tagIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      }
    ]
  },
  { _id: false }
);


const UserSchema = new mongoose.Schema(
  {
    googleUserId: { type: String },
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    profileImage: { type: String },
    profileBanner: { type: String },
    profilePhotos: [{ type: String }],
    bio: { type: String },
    location: { type: String },
    dob: { type: Date },
    pronoun: { type: String },
    gender: { type: String },
    socialLinks: [
      {
        platform: { type: String, required: true },
        url: { type: String, required: true },
      }
    ],
    averageRating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    interests: [userInterestSchema],
    eventCount: { type: Number, default: 0 },
    eventLimit: { type: Number, default: 50 },
    isPremium: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    role: { type: String, enum: ["User", "Admin"], default: "User" },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Events', default: [] }],
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
