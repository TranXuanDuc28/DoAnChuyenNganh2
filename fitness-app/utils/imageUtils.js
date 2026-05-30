import * as ImageManipulator from 'expo-image-manipulator';

/**
 * Compresses an image for upload.
 * @param {string} uri - The URI of the image to compress.
 * @param {number} maxWidth - Maximum width of the compressed image.
 * @param {number} quality - Compression quality (0 to 1).
 * @returns {Promise<Object>} - The manipulated image object.
 */
export const compressImage = async (uri, maxWidth = 1024, quality = 0.8) => {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: maxWidth } }],
      { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
    );
    return result;
  } catch (error) {
    console.error('Error compressing image:', error);
    return { uri }; // Return original URI if compression fails
  }
};
