import mongoose from "mongoose";
import Tags from "../src/models/tags.model.js";

const mongoUrl = "mongodb://127.0.0.1:27017/viblooop"

const connectDB = async () => {
  try {
    await mongoose.connect(mongoUrl)
  } catch (err) {
    process.exit(1)
  }
}

await connectDB()

const tags = [
  "travel",
  "adventure",
  "fun",
  "community",
  "social",
  "education",
  "music",
  "party",
  "volunteering",
  "sports",
  "networking",
  "gaming",
  "outdoor",
  "culture",
  "tech",
  "fitness",
  "learning",
  "photography",
];

const tagSeed = async () => {
  try {
    await Tags.deleteMany();

    await Tags.insertMany(
      tags.map(name => ({ name }))
    );

    console.log("tags inserted successfully");
    process.exit(0);
  } catch (e) {
    console.log("Error while seeding tags");
    process.exit(1);
  }
};

await tagSeed();
