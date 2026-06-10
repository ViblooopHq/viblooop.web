import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const eventImagePath = 'uploads/event/images';
const galleryImagePath = 'uploads/event/gallery';

// Ensure the directories exist
[eventImagePath, galleryImagePath].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'image') {
      cb(null, eventImagePath);
    } else if (file.fieldname === 'gallery') {
      cb(null, galleryImagePath);
    } else {
      cb(new Error('Invalid field name'), null);
    }
  },
  filename: function (req, file, cb) {
    const uniqueName = `${file.fieldname}-${Date.now()}-${crypto.randomBytes(6).toString('hex')}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

export const uploadEventImages = multer({
  storage,
  fileFilter
}).fields([
  { name: 'image', maxCount: 1 },
  { name: 'gallery', maxCount: 10 }
]);
