import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema({
  street: { type: String, required: true },     
  area: { type: String },                         
  landmark: { type: String },                   
  city: { type: String, required: true },                 
  state: { type: String, required: true },
  pinCode: { type: String , required: true },
  country: { type: String, required: true },

  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], index: "2dsphere" }
  }
}, {_id: false, timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

// Full address
AddressSchema.virtual("fullAddress").get(function () {
  return [
    this.street,
    this.area,
    this.landmark,
    this.city,
    this.state,
    this.pinCode,
    this.country
  ].filter(Boolean).join(", ").trim();
});

// Partial address (example: city + state + country only)
AddressSchema.virtual("partialAddress").get(function () {
  return [
    this.area,
    this.city
  ].filter(Boolean).join(", ").trim();
});

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      required: true,
    },

    eventDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
    },

    eventTime: {
      type: String,
      required: true,
    },

    address: AddressSchema,

    attendeeLimit: {
      type: Number,
    },

    audiencePreference: {
      type: String,
      enum: ["open", "women", "men"],
      default: "open",
    },

    attendeeMix: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },

    attendees: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],

    cost: {
      type: String,
      enum: ["Free", "Paid"],
      default: "Free",
    },
    price: {
      type: Number,
      default: 0,
    },

    tags: [{ type: String }],

    gallery: {
      type: [String],
      default: [],
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EventCategory",
      required: true,
    },
    averageRating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

const EventModel = new mongoose.model("Events", eventSchema);

export default EventModel;
