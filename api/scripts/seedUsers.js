import mongoose from 'mongoose';
import User from '../src/models/user/user.model.js';
import bcrypt from 'bcryptjs';

const mongoUrl = "mongodb://127.0.0.1:27017/viblooop"

const seedUsers = async () => {
  await mongoose.connect(mongoUrl);
  await User.deleteMany();

  const users = [
    {
      username: 'Admin User',
      email: 'admin@viblooop.com',
      password: await bcrypt.hash('admin123', 10),
      role: 'Admin',
      profileImage: 'https://images.unsplash.com/photo-1603415526960-f7e0328a1d25?w=400',
      profileBanner: 'https://images.unsplash.com/photo-1503264116251-35a269479413?w=1200',
      bio: "Super admin of Viblooop.",
      pronoun: "He/Him",
      gender: "Male",
      isPremium: true,
    },
    {
      username: 'Regular User',
      email: 'user@example.com',
      password: await bcrypt.hash('user123', 10),
      role: 'User',
      profileImage: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=400',
      profileBanner: 'https://images.unsplash.com/photo-1485217988980-11786ced9454?w=1200',
      bio: "Just a regular user trying out Viblooop.",
      pronoun: "She/Her",
      gender: "Female",
    },
    {
      username: 'John Doe',
      email: 'john@example.com',
      password: await bcrypt.hash('john123', 10),
      role: 'User',
      profileImage: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=400',
      profileBanner: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200',
      bio: "Loves attending and hosting events.",
      pronoun: "He/Him",
      gender: "Male",
    },
    {
      username: 'Jane Smith',
      email: 'jane@example.com',
      password: await bcrypt.hash('jane123', 10),
      role: 'User',
      profileImage: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400',
      profileBanner: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1200',
      bio: "Passionate about connecting with people.",
      pronoun: "She/Her",
      gender: "Female",
    }
  ];

  await User.insertMany(users);
  console.log("Database seeded with sample users (with profile & banner images).");
  process.exit();
};

seedUsers();
