import { Readable } from 'stream';
import cloudinary from '../config/cloudinary.js';
import { AppError } from '../utils/AppError.js';

export const uploadBuffer = async (buffer, folder = 'showtime/movies') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        transformation: [
          { width: 1600, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return reject(
            new AppError(
              'Failed to upload image to cloud storage provider.',
              502,
              'UPLOAD_PROVIDER_ERROR'
            )
          );
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    const stream = Readable.from(buffer);
    stream.pipe(uploadStream);
  });
};

export const deleteAsset = async (publicId) => {
  if (!publicId) return;
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error(`Failed to delete Cloudinary asset (${publicId}):`, error.message);
  }
};

export default {
  uploadBuffer,
  deleteAsset,
};
