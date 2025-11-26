const fs = require('fs');
const path = require('path');

// Thư mục lưu ảnh đánh giá
const IMAGES_DIR = path.join(__dirname, '../uploads/evaluations');

// Tạo thư mục nếu chưa tồn tại
if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

/**
 * Lưu ảnh base64 vào disk
 * @param {string} base64Data - Dữ liệu base64 (có hoặc không có prefix)
 * @param {string} type - Loại ảnh: 'input', 'result', 'reference', 'comparison'
 * @param {number} userId - ID người dùng
 * @param {string} exerciseName - Tên bài tập
 * @returns {string} - Đường dẫn file đã lưu
 */
function saveImageToDisk(base64Data, type, userId, exerciseName) {
    try {
        // Loại bỏ prefix nếu có
        const base64String = base64Data.replace(/^data:image\/\w+;base64,/, '');

        // Tạo buffer từ base64
        const buffer = Buffer.from(base64String, 'base64');

        // Tạo tên file unique
        const timestamp = Date.now();
        const filename = `${userId}_${exerciseName}_${type}_${timestamp}.jpg`;
        const filepath = path.join(IMAGES_DIR, filename);

        // Lưu file
        fs.writeFileSync(filepath, buffer);

        // Trả về đường dẫn tương đối
        return `/uploads/evaluations/${filename}`;
    } catch (error) {
        console.error(`[ImageStorage] Error saving ${type} image:`, error);
        return null;
    }
}

/**
 * Xóa ảnh khỏi disk
 * @param {string} imagePath - Đường dẫn ảnh cần xóa
 */
function deleteImage(imagePath) {
    try {
        if (!imagePath) return;

        const fullPath = path.join(__dirname, '..', imagePath);
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            console.log(`[ImageStorage] Deleted image: ${imagePath}`);
        }
    } catch (error) {
        console.error('[ImageStorage] Error deleting image:', error);
    }
}

/**
 * Lấy URL đầy đủ của ảnh
 * @param {string} imagePath - Đường dẫn tương đối
 * @param {string} baseUrl - Base URL của server (từ req.protocol + req.get('host'))
 * @returns {string} - URL đầy đủ
 */
function getImageUrl(imagePath, baseUrl) {
    if (!imagePath) return null;
    return `${baseUrl}${imagePath}`;
}

module.exports = {
    saveImageToDisk,
    deleteImage,
    getImageUrl,
    IMAGES_DIR
};
