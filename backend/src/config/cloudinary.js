import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const configured =
  Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
  Boolean(process.env.CLOUDINARY_API_KEY) &&
  Boolean(process.env.CLOUDINARY_API_SECRET);

if (configured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Upload a local file buffer/path to Cloudinary when configured.
 * @param {string} filePath absolute path from multer
 * @param {string} folder
 * @returns {Promise<string>} secure URL or empty if skipped
 */
export async function uploadFileToCloudinary(filePath, folder = 'worksure') {
  if (!configured) return null;
  const res = await cloudinary.uploader.upload(filePath, { folder });
  return res.secure_url;
}

export function isCloudinaryEnabled() {
  return configured;
}
