import bcrypt from "bcryptjs";
import fs from "fs";
import User from "../models/user/user.model.js";
import Events from "../models/event/event.model.js";
import InterestCategory from "../models/user/interestCategory.model.js";
import { sendResponse } from "../utils/response.util.js";
import { cleanupFiles } from "../utils/deleteFile.util.js";
import { verifyFace } from "../services/verify-user.service.js";

export async function getUserProfile(req, res) {
  try {
    let userId = req.body.userId;
    if (!userId) {
      userId = req.user.id;
    }

    if (!userId) {
      return sendResponse(res, 404, false, "User not found");
    }

    const user = await User.findById(userId);
    if (!user) {
      return sendResponse(res, 404, false, "User not found");
    }

    const interests = await getInterests(user.interests);

    const profileData = {
      userName: user.username,
      email: user.email,
      profileImage: user.profileImage,
      profileBanner: user.profileBanner,
      profilePhotos: normalizeProfilePhotos(user.profilePhotos),
      bio: user.bio,
      location: user.location,
      pronoun: user.pronoun,
      gender: user.gender,
      socialLinks: normalizeSocialLinks(user.socialLinks),
      averageRating: user.averageRating,
      totalRatings: user.totalRatings,
      verified: user.verified,
      interests: [...interests],
      joinedIn: user.createdAt,
      dob: user.dob,
      wishlist: user.wishlist || [],
    };

    return sendResponse(res, 200, true, "User fetched successfully", profileData);
  } catch (e) {
    return sendResponse(res, 500, false, e.message || "Internal Server Error");
  }
}

async function getInterests(interests) {
  const categoryIds = interests.map((i) => i.categoryId);
  const tagIds = interests.flatMap((i) => i.tagIds).map((id) => id.toString());
  const categories = await InterestCategory.find({ _id: { $in: categoryIds } })
    .select({ tags: 1 })
    .lean();

  const allTags = categories.flatMap((cat) => cat.tags);
  const tagMap = new Map(allTags.map((tag) => [
    tag._id.toString(),
    {
      key: tag.key,
      label: tag.label,
      icon: tag.icon,
    }
  ]));

  const selectedTags = tagIds
    .filter((tagId) => tagMap.has(tagId))
    .map((tagId) => tagMap.get(tagId));

  return selectedTags;
}

export async function getBasicUserInfo(userId) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return null;
    }

    const profileData = {
      userName: user.username,
      profileImage: user.profileImage,
      verified: user.verified,
    };

    return profileData;
  } catch (e) {
    return null;
  }
}

export async function getAvailableEventLimit(req, res) {
  try {
    const userId = req.body.userId;

    const user = await User.findById(userId);
    if (!user) {
      return sendResponse(res, 404, false, "User not found");
    }

    return sendResponse(
      res,
      200,
      true,
      "User fetched successfully",
      user.eventLimit
    );
  } catch (e) {
    return sendResponse(res, 500, false, e.message || "Internal Server Error");
  }
}

export async function updateUserProfile(req, res) {
  const profileImage = req.files?.profileImage?.[0];
  const profileBanner = req.files?.profileBanner?.[0];
  const selfieImage = req.files?.selfieImage?.[0];
  const profilePhotoFiles = req.files?.profilePhotos ?? [];

  try {
    const {
      username,
      email,
      password,
      interests,
      bio,
      location,
      pronoun,
      gender,
      dob,
      socialLinks,
      existingProfilePhotos,
    } = req.body;

    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      const allFiles = [];
      if (profileImage) allFiles.push(profileImage.path);
      if (profileBanner) allFiles.push(profileBanner.path);
      if (selfieImage) allFiles.push(selfieImage.path);
      if (profilePhotoFiles.length) allFiles.push(...profilePhotoFiles.map((file) => file.path));

      await cleanupFiles(allFiles);
      return sendResponse(res, 404, false, "User not found");
    }

    if (Object.hasOwn(req.body, "username")) user.username = username;
    if (Object.hasOwn(req.body, "email")) user.email = email;
    if (Object.hasOwn(req.body, "password")) user.password = password;
    if (Object.hasOwn(req.body, "bio")) user.bio = bio;
    if (Object.hasOwn(req.body, "location")) user.location = location;
    if (Object.hasOwn(req.body, "dob")) user.dob = dob;
    if (Object.hasOwn(req.body, "pronoun")) user.pronoun = pronoun;
    if (Object.hasOwn(req.body, "gender")) user.gender = gender;
    if (Object.hasOwn(req.body, "socialLinks")) user.socialLinks = parseSocialLinks(socialLinks);

    if (profileImage) {
      if (user.profileImage && user.profileImage.startsWith("uploads")) {
        await cleanupFiles([user.profileImage]);
      }
      user.profileImage = profileImage.path;
    }

    if (profileBanner) {
      if (user.profileBanner && user.profileBanner.startsWith("uploads")) {
        await cleanupFiles([user.profileBanner]);
      }
      user.profileBanner = profileBanner.path;
    }

    if (Object.hasOwn(req.body, "existingProfilePhotos") || profilePhotoFiles.length) {
      const keptProfilePhotos = Object.hasOwn(req.body, "existingProfilePhotos")
        ? parseStringArray(existingProfilePhotos)
        : normalizeProfilePhotos(user.profilePhotos);
      const removedProfilePhotos = normalizeProfilePhotos(user.profilePhotos)
        .filter((photo) => photo.startsWith("uploads") && !keptProfilePhotos.includes(photo));

      if (removedProfilePhotos.length) {
        await cleanupFiles(removedProfilePhotos);
      }

      const newProfilePhotos = profilePhotoFiles.map((file) => file.path);
      const nextProfilePhotos = [
        ...keptProfilePhotos,
        ...newProfilePhotos,
      ].slice(0, 12);
      const unusedNewProfilePhotos = newProfilePhotos.filter((photo) => !nextProfilePhotos.includes(photo));

      if (unusedNewProfilePhotos.length) {
        await cleanupFiles(unusedNewProfilePhotos);
      }

      user.profilePhotos = nextProfilePhotos;
    }

    if (interests) user.interests = JSON.parse(interests);
    await user.save();
    if (selfieImage) await cleanupFiles([selfieImage.path]);

    return sendResponse(res, 201, true, "Profile updated successfully", []);
  } catch (e) {
    const allFiles = [];
    if (profileImage) allFiles.push(profileImage.path);
    if (profileBanner) allFiles.push(profileBanner.path);
    if (selfieImage) allFiles.push(selfieImage.path);
    if (profilePhotoFiles.length) allFiles.push(...profilePhotoFiles.map((file) => file.path));

    await cleanupFiles(allFiles);

    return sendResponse(res, 500, false, e.message || "Internal Server Error");
  }
}

function parseSocialLinks(value) {
  try {
    const links = typeof value === "string" ? JSON.parse(value) : value;
    return normalizeSocialLinks(links);
  } catch {
    return [];
  }
}

function normalizeSocialLinks(links) {
  if (!Array.isArray(links)) return [];

  return links
    .map((link) => ({
      platform: String(link?.platform || "").trim().toLowerCase(),
      url: String(link?.url || "").trim(),
    }))
    .filter((link) => link.platform && /^https?:\/\/\S+\.\S+/i.test(link.url))
    .slice(0, 6);
}

function parseStringArray(value) {
  try {
    const items = typeof value === "string" ? JSON.parse(value) : value;
    return normalizeProfilePhotos(items);
  } catch {
    return [];
  }
}

function normalizeProfilePhotos(photos) {
  if (!Array.isArray(photos)) return [];

  return photos
    .map((photo) => String(photo || "").trim())
    .filter(Boolean)
    .slice(0, 12);
}

export async function verifySelfieProfile(req, res) {
  const profileImage = req.files?.profileImage?.[0];
  const selfieImage = req.files?.selfieImage?.[0];

  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      const allFiles = [];
      if (profileImage) allFiles.push(profileImage.path);
      if (selfieImage) allFiles.push(selfieImage.path);

      await cleanupFiles(allFiles);
      return sendResponse(res, 404, false, "User not found");
    }

    if (!profileImage || !selfieImage) {
      const allFiles = [];
      if (profileImage) allFiles.push(profileImage.path);
      if (selfieImage) allFiles.push(selfieImage.path);

      await cleanupFiles(allFiles);
      return sendResponse(res, 400, false, "Profile photo and selfie are required");
    }

    const verified = await verifyFace(userId, selfieImage.path, profileImage.path);

    if (!verified.verified) {
      await cleanupFiles([profileImage.path, selfieImage.path]);
      return sendResponse(res, 400, false, "Selfie verification failed");
    }

    user.verified = verified.verified;
    await user.save();
    await cleanupFiles([profileImage.path, selfieImage.path]);

    return sendResponse(res, 200, true, "Selfie verified successfully", {
      verified: user.verified,
    });
  } catch (e) {
    const allFiles = [];
    if (profileImage) allFiles.push(profileImage.path);
    if (selfieImage) allFiles.push(selfieImage.path);

    await cleanupFiles(allFiles);
    return sendResponse(res, 500, false, e.message || "Internal Server Error");
  }
}

export async function updatePassword(req, res) {
  try {
    const { newPassword } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return sendResponse(res, 404, false, "User not found");
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return sendResponse(res, 201, true, "Password updated successfully");
  } catch (e) {
    return sendResponse(res, 500, false, e.message || "Internal Server Error");
  }
}

export async function getAllUsers(req, res) {
  try {
    const users = await User.find({});

    if (!users) {
      return sendResponse(res, 404, false, "No Users Found");
    }

    return sendResponse(res, 200, true, "Users fetched successfully", users);
  } catch (e) {
    return sendResponse(res, 500, false, e.message || "Internal Server Error");
  }
}

export async function deleteUser(req, res) {
  try {
    const userId = req.body.userId;

    const user = await User.findById(userId);
    if (!user) {
      return sendResponse(res, 404, false, "User not found");
    }

    await User.findByIdAndDelete(userId);

    return sendResponse(res, 200, true, "User deleted successfully");
  } catch (e) {
    return sendResponse(res, 500, false, e.message || "Internal Server Error");
  }
}

export async function getAttendeesDetails(req, res) {
  try {
    const userIds = req.body.attendeeIds;

    const users = await User.find({ _id: { $in: userIds } });

    if (!users) {
      return sendResponse(res, 404, false, "No Users Found");
    }

    const profileData = users.map((user) => ({
      userName: user.username,
      email: user.email,
      profileImage: user.profileImage,
      profileBanner: user.profileBanner,
      bio: user.bio,
      pronoun: user.pronoun,
      gender: user.gender,
      averageRating: user.averageRating,
      totalRatings: user.totalRatings,
      verified: user.verified,
      interests: user.interests,
      userId: user._id,
    }));

    return sendResponse(
      res,
      200,
      true,
      "Users fetched successfully",
      profileData
    );
  } catch (e) {
    return sendResponse(res, 500, false, e.message || "Internal Server Error");
  }
}

export async function getAllInterests(req, res) {
  try {
    const allInterests = await InterestCategory.find({});
    return sendResponse(
      res,
      200,
      true,
      "Interests fetched successfully",
      allInterests
    );
  } catch (e) {
    return sendResponse(res, 500, false, e.message || "Internal Server Error");
  }
}

export async function toggleWishlistEvent(req, res) {
  try {
    const { eventId } = req.body;
    const userId = req.user.id;

    if (!eventId) {
      return sendResponse(res, 400, false, "Event ID is required");
    }

    // Verify event exists before adding
    const eventExists = await Events.exists({ _id: eventId });
    if (!eventExists) {
      // If it doesn't exist, ensure it's removed from any wishlist it might be in
      await User.findByIdAndUpdate(userId, { $pull: { wishlist: eventId } });
      return sendResponse(res, 404, false, "Event not found");
    }

    const user = await User.findById(userId).select('wishlist');
    if (!user) {
      return sendResponse(res, 404, false, "User not found");
    }

    const isWishlisted = user.wishlist && user.wishlist.some(id => id.toString() === eventId.toString());

    let update;
    if (isWishlisted) {
      update = { $pull: { wishlist: eventId } };
    } else {
      update = { $addToSet: { wishlist: eventId } };
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      update,
      { new: true }
    ).select('wishlist');

    return sendResponse(res, 200, true, "Wishlist updated successfully", updatedUser.wishlist);
  } catch (e) {
    return sendResponse(res, 500, false, e.message || "Internal Server Error");
  }
}

export async function getWishlistedEvents(req, res) {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate({
      path: 'wishlist',
      populate: [
        { path: 'createdBy', select: 'username email profileImage averageRating' },
        { path: 'category', select: 'title' }
      ]
    });

    if (!user) {
      return sendResponse(res, 404, false, "User not found");
    }

    // Filter out null values (deleted events)
    const validWishlist = user.wishlist.filter(event => event !== null);

    // If we found deleted events, clean them up from the user's wishlist array permanently
    if (validWishlist.length !== user.wishlist.length) {
      const validIds = validWishlist.map(event => event._id);
      await User.findByIdAndUpdate(userId, { $set: { wishlist: validIds } });
    }

    return sendResponse(res, 200, true, "Wishlisted events fetched successfully", validWishlist);
  } catch (e) {
    return sendResponse(res, 500, false, e.message || "Internal Server Error");
  }
}

export async function deactivateAccount(req, res) {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return sendResponse(res, 404, false, "User not found");
    }
    user.isActive = false;
    await user.save();
    return sendResponse(res, 200, true, "Account deactivated successfully");
  } catch (e) {
    return sendResponse(res, 500, false, e.message || "Internal Server Error");
  }
}
