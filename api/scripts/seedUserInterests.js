import mongoose from "mongoose";
import InterestCategory from "../src/models/user/interestCategory.model.js";

const mongoUrl = "mongodb://127.0.0.1:27017/viblooop"

const connectDB = async () => {
  try {
    await mongoose.connect(mongoUrl)
  } catch (err) {
    process.exit(1)
  }
}

await connectDB()

const viblooopInterests = [
  { key: 'rooftops', label: 'Rooftops', icon: 'fa-solid fa-building' },
  { key: 'food', label: 'Food', icon: 'fa-solid fa-bowl-food' },
  { key: 'karaoke', label: 'Karaoke', icon: 'fa-solid fa-microphone-lines' },
  { key: 'games', label: 'Games', icon: 'fa-solid fa-gamepad' },
  { key: 'drives', label: 'Drives', icon: 'fa-solid fa-car-side' },
  { key: 'sunrise', label: 'Sunrise', icon: 'fa-solid fa-sun' },
  { key: 'chai', label: 'Chai', icon: 'fa-solid fa-mug-hot' },
  { key: 'shopping', label: 'Shopping', icon: 'fa-solid fa-bag-shopping' },
  { key: 'cafes', label: 'Cafes', icon: 'fa-solid fa-mug-saucer' },
  { key: 'movies', label: 'Movies', icon: 'fa-solid fa-film' },
  { key: 'travel', label: 'Travel', icon: 'fa-solid fa-route' },
  { key: 'photography', label: 'Photography', icon: 'fa-solid fa-camera' },
  { key: 'music', label: 'Music', icon: 'fa-solid fa-music' },
  { key: 'dining', label: 'Dining', icon: 'fa-solid fa-utensils' },
  { key: 'nightlife', label: 'Nightlife', icon: 'fa-solid fa-martini-glass-citrus' },
  { key: 'social', label: 'Social', icon: 'fa-solid fa-user-group' }
];

const interestData = [
  {
    name: "Viblooop Interests",
    description: "Interest chips shown in Viblooop profiles",
    tags: viblooopInterests
  }
];

const seed = async () => {
  try {

    await InterestCategory.deleteMany({});
    console.log("Old interests cleared.");

    // Insert new categories
    await InterestCategory.insertMany(interestData);
    console.log("Interests seeded successfully!");

    process.exit();
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
};

seed();
