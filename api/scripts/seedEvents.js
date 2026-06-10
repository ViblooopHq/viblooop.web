import mongoose from "mongoose";
import EventCategory from "../src/models/event/category.model.js";
import EventModel from "../src/models/event/event.model.js";

const mongoUrl = "mongodb://127.0.0.1:27017/viblooop"

const connectDB = async () => {
  try {
    await mongoose.connect(mongoUrl)
  } catch (err) {
    process.exit(1)
  }
}

await connectDB()

console.log("DB Connected")

// 🔹 Fixed user IDs you provided
const userIds = [
  new mongoose.Types.ObjectId("68b73948a72cc33587d0f52d"),
  new mongoose.Types.ObjectId("68b73948a72cc33587d0f52e"),
  new mongoose.Types.ObjectId("68b73948a72cc33587d0f52f"),
  new mongoose.Types.ObjectId("68b73948a72cc33587d0f530"),
];

const eventCategories = [
  {
    title: "Party",
    description: "Connect with fun people and party at amazing venues.",
    icon: "fa-solid fa-house",
    image:
      "https://c8.alamy.com/comp/MYMKR6/four-friends-lifting-a-woman-over-their-heads-horizontally-up-to-the-ceiling-at-a-house-party-young-men-and-women-having-fun-at-a-colorful-house-part-MYMKR6.jpg",
    tags: ["party", "music", "fun"],
  },
  {
    title: "Travel",
    description: "Find your next travel buddy for an unforgettable journey.",
    icon: "fa-solid fa-plane-departure",
    image:
      "https://images.travelandleisureasia.com/wp-content/uploads/sites/2/2021/01/14101943/New-Featured-1-3.jpg?tr=w-480,f-jpg,pr-true",
    tags: ["travel", "adventure", "explore"],
  },
  {
    title: "Sports",
    description:
      "Join games, tournaments, or casual meetups to stay fit and make friends.",
    icon: "fa-solid fa-futbol",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9ApjpbD72qAVZde6hbsgHDOwBkcr6Yk8HmQ&s",
    tags: ["sports", "fitness", "team"],
  },
  {
    title: "Events",
    description:
      "Explore what's happening near you — from exhibitions to fests.",
    icon: "fa-solid fa-city",
    image:
      "https://event-hubs.s3-ap-southeast-2.amazonaws.com/EventsConnect/sliders/hero-slider4.webp",
    tags: ["local", "events", "explore"],
  },
  {
    title: "Shopping",
    description: "Find people who love to explore markets and malls together.",
    icon: "fa-solid fa-bag-shopping",
    image:
      "https://images.contentstack.io/v3/assets/blt24b06c4905f92e56/bltbb6709c2d4c7ed9e/67ec4e87f44ece155441e19b/Shopping_shutterstock_644794222_white-balanced_032125_LYS.webp",
    tags: ["shopping", "malls", "buddies"],
  },
];

// 🔹 Generate events with fixed user IDs
function generateEvents(categoryMap) {
  return [
    {
      title: "Everest Base Camp Trek",
      description:
        "A once-in-a-lifetime trekking adventure to Everest Base Camp.",
      image:
        "https://images.prismic.io/elite-exped/b4d85354-c868-45dd-9e5e-66559e8a9a50_Everest+Base+camp.jpg?auto=format&rect=0,0,3000,2000&w=1200&h=800&dpr=1.5",
      eventDate: new Date("2025-09-10"),
      eventTime: "08:00:00",
      address: {
        street: "Dozo, Room No 3",
        area: "Electronic City, Phase 2",
        landmark: "Electronic City",
        city: "BANGALORE",
        state: "Karnataka",
        pinCode: "560091",
        country: "India",
      },
      attendeeLimit: 15,
      attendees: [userIds[0], userIds[1]], // both attendees
      cost: "Paid",
      tags: ["trekking", "mountains", "adventure"],
      gallery: [
        "https://www.acethehimalaya.com/wp-content/uploads/2022/08/everest-base-camp-kalapatthar-600x450.jpg",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUkptrwBuT5N0kmdp0qmf_7_Kx2rVYuGnfJLWiPj_8R3bfya98cKM3E7WjxBIMjozJdUg&usqp=CAU",
        "https://media.tacdn.com/media/attractions-splice-spp-674x446/07/86/cd/d6.jpg",
        "https://www.adventurewhitemountain.com/uploads/img/1643358737-everest-base-camp-trek.jpg",
      ],
      createdBy: userIds[2],
      category: categoryMap["Travel"],
      averageRating: 4.7,
      totalRatings: 120,
    },
    {
      title: "Kathmandu Neon Night Party",
      description:
        "Enjoy neon lights, music, and dance with new friends in Kathmandu.",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRSh3ETMI0f-15hlW4h9a83LL7MFljHR6OW6A&s",
      eventDate: new Date("2025-09-15"),
      eventTime: "20:00:00",
      address: {
        street: "Dozo, Room No 3",
        area: "Electronic City, Phase 2",
        landmark: "Electronic City",
        city: "BANGALORE",
        state: "Karnataka",
        pinCode: "560091",
        country: "India",
      },
      attendeeLimit: 50,
      attendees: [userIds[1]], // attendee
      cost: "Free",
      tags: ["party", "nightlife", "music"],
      gallery: [],
      createdBy: userIds[0],
      category: categoryMap["Party"],
      averageRating: 4.3,
      totalRatings: 35,
    },
    {
      title: "Weekend Football Meetup",
      description:
        "Join us for a friendly football match and meet fellow sports lovers.",
      image:
        "https://assets.telegraphindia.com/telegraph/2021/Nov/1635924820_lead-image.jpg",
      eventDate: new Date("2025-09-20"),
      eventTime: "08:00:00",
      address: {
        street: "Dozo, Room No 3",
        area: "Electronic City, Phase 2",
        landmark: "Electronic City",
        city: "BANGALORE",
        state: "Karnataka",
        pinCode: "560091",
        country: "India",
      },
      attendeeLimit: 22,
      attendees: [userIds[0], userIds[1]],
      cost: "Free",
      tags: ["football", "sports", "fitness"],
      gallery: [],
      createdBy: userIds[3],
      category: categoryMap["Sports"],
      averageRating: 4.0,
      totalRatings: 10,
    },
    {
      title: "Lalitpur Street Food Festival",
      description:
        "Discover the flavors of Nepal at this local food and cultural festival.",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWtbz1v3ceoECgLJt9rK4TXVigU3Xu1XwLZQ&s",
      eventDate: new Date("2025-09-25"),
      eventTime: "10:00:00",
      address: {
        street: "Dozo, Room No 3",
        area: "Electronic City, Phase 2",
        landmark: "Electronic City",
        city: "BANGALORE",
        state: "Karnataka",
        pinCode: "560091",
        country: "India",
      },
      attendeeLimit: 200,
      attendees: [userIds[2], userIds[3]],
      cost: "Paid",
      tags: ["food", "festival", "local"],
      gallery: [],
      createdBy: userIds[0],
      category: categoryMap["Events"],
      averageRating: 4.6,
      totalRatings: 80,
    },
    {
      title: "Durbar Mall Shopping Spree",
      description:
        "Join shopping buddies for a group mall hopping and deals hunt.",
      image:
        "https://www.shutterstock.com/image-photo/chiang-mai-thailand-july-222023-600nw-2385705239.jpg",
      eventDate: new Date("2025-09-30"),
      eventTime: "14:00:00",
      address: {
        street: "Dozo, Room No 3",
        area: "Electronic City, Phase 2",
        landmark: "Electronic City",
        city: "BANGALORE",
        state: "Karnataka",
        pinCode: "560091",
        country: "India",
      },
      attendeeLimit: 10,
      attendees: [userIds[1]],
      cost: "Free",
      tags: ["shopping", "deals", "friends"],
      gallery: [],
      createdBy: userIds[2],
      category: categoryMap["Shopping"],
      averageRating: 4.2,
      totalRatings: 15,
    },
  ];
}

const seedDatabase = async () => {
  try {
    console.log("Clearing existing data...")
    await EventModel.deleteMany();
    await EventCategory.deleteMany();

    console.log("Inserting categories...")
    const insertedCategories = await EventCategory.insertMany(eventCategories);
    console.log("✅ Categories inserted");

    const categoryMap = {};
    insertedCategories.forEach((cat) => {
      categoryMap[cat.title] = cat._id;
    });

    // Generate and insert events
    const events = generateEvents(categoryMap);
    await EventModel.insertMany(events);

    console.log("✅ Events seeded successfully!");
    process.exit();
  } catch (err) {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  }
};

seedDatabase();
