import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const userProfilePath = "uploads/user";

if (!fs.existsSync(userProfilePath)) {
  fs.mkdirSync(userProfilePath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (["profileImage", "profileBanner", "selfieImage", "profilePhotos"].includes(file.fieldname)) {
      cb(null, userProfilePath);
    } else {
      cb(new Error("Invalid field name"), null);
    }
  },
  filename: function (req, file, cb) {
    const uniqueName = `${file.fieldname}-${Date.now()}-${crypto
      .randomBytes(6)
      .toString("hex")}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",
    "image/gif",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

export const uploadProfileImages = multer({
  storage,
  fileFilter,
}).fields([
  { name: "profileImage", maxCount: 1 },
  { name: "profileBanner", maxCount: 1 },
  { name: "selfieImage", maxCount: 1 },
  { name: "profilePhotos", maxCount: 12 },
]);
