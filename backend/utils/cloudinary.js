const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload image/video to Cloudinary from buffer or file path
 * @param {Buffer|string} file - File buffer or path
 * @param {string} folder - Cloudinary folder name
 * @param {Object} customOptions - Custom Cloudinary options (e.g., {resource_type: 'video'})
 * @returns {Promise<{url: string, publicId: string}>}
 */
const uploadToCloudinary = async (file, folder = 'fitness-app', customOptions = {}) => {
  try {
    const options = {
      folder: folder,
      resource_type: customOptions.resource_type || 'auto',
      quality: 'auto:good',
      fetch_format: 'auto',
      ...customOptions
    };

    let result;
    
    // If file is a buffer (from multer memory storage)
    if (Buffer.isBuffer(file)) {
      result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          options,
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(file);
      });
    } 
    // If file is a path string
    else if (typeof file === 'string') {
      result = await cloudinary.uploader.upload(file, options);
    }
    // If file is multer file object
    else if (file && file.path) {
      result = await cloudinary.uploader.upload(file.path, options);
    }
    else {
      throw new Error('Invalid file format');
    }

    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

/**
 * Delete image/video from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @param {string} resourceType - Resource type ('image' or 'video')
 * @returns {Promise<void>}
 */
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    if (!publicId) return;
    
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    console.log(`Deleted ${resourceType} from Cloudinary: ${publicId}`);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    // Don't throw error, just log it
  }
};

/**
 * Delete multiple images from Cloudinary
 * @param {string[]} publicIds - Array of Cloudinary public IDs
 * @returns {Promise<void>}
 */
const deleteMultipleFromCloudinary = async (publicIds) => {
  try {
    if (!publicIds || publicIds.length === 0) return;
    
    await cloudinary.api.delete_resources(publicIds);
    console.log(`Deleted ${publicIds.length} images from Cloudinary`);
  } catch (error) {
    console.error('Cloudinary bulk delete error:', error);
  }
};

/**
 * Create multer storage for direct upload to Cloudinary
 * @param {string} folder - Cloudinary folder name
 * @returns {CloudinaryStorage}
 */
const createCloudinaryStorage = (folder = 'fitness-app') => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [{ quality: 'auto:good' }]
    }
  });
};

/**
 * Create multer memory storage (for manual upload control)
 * @returns {multer.StorageEngine}
 */
const createMemoryStorage = () => {
  return multer.memoryStorage();
};

/**
 * Multer file filter for images and videos
 */
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|mov|avi|mkv|webm/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = /image\/(jpeg|jpg|png|gif|webp)|video\/(mp4|quicktime|x-msvideo|x-matroska|webm)/.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed'));
  }
};

/**
 * Create multer upload middleware with memory storage
 * @param {Object} options - Multer options
 * @returns {multer.Multer}
 */
const createUploadMiddleware = (options = {}) => {
  return multer({
    storage: createMemoryStorage(),
    fileFilter: imageFileFilter,
    limits: {
      fileSize: options.maxSize || 100 * 1024 * 1024 // Default 100MB for videos
    }
  });
};

/**
 * Extract public ID from Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string|null}
 */
const extractPublicId = (url) => {
  try {
    if (!url || !url.includes('cloudinary.com')) return null;
    
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return null;
    
    // Get everything after 'upload' and version (v1234567890)
    const pathParts = parts.slice(uploadIndex + 2); // Skip 'upload' and version
    const fullPath = pathParts.join('/');
    
    // Remove file extension
    return fullPath.replace(/\.[^/.]+$/, '');
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
  deleteMultipleFromCloudinary,
  createCloudinaryStorage,
  createMemoryStorage,
  createUploadMiddleware,
  imageFileFilter,
  extractPublicId
};

