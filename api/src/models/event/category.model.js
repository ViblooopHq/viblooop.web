import mongoose from "mongoose";

const eventCategorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },

  icon: {
    type: String
  },

  image: {
    type: String,
    required: true,
  },

  tags: {
    type: [String],
    default: [],
  }
}, {
  timestamps: true,
});

const EventCategoryModel = new mongoose.model('EventCategory', eventCategorySchema);

export default EventCategoryModel;
