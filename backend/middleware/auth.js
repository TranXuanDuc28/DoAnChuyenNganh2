const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware bắt buộc xác thực (yêu cầu token hợp lệ)
const auth = async (req, res, next) => {
  try {
    // Ưu tiên token từ header Authorization
    let token = req.header('Authorization')?.replace('Bearer ', '');

    // Nếu không có token trong header thì thử lấy từ query string (dành cho video streaming)
    if (!token && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({ message: 'Không có token, truy cập bị từ chối' });
    }

    // Giải mã token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Tìm user theo ID trong token
    const user = await User.findByPk(decoded.id || decoded.user_id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(401).json({ message: 'Token không hợp lệ hoặc người dùng không tồn tại' });
    }

    // Gắn thông tin user vào request để dùng ở controller
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Lỗi ở auth middleware:', error);
    res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};

// Middleware xác thực tùy chọn (nếu có token thì giải mã, nếu không thì bỏ qua)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id || decoded.user_id, {
        attributes: { exclude: ['password'] }
      });
      if (user) {
        req.user = user;
      }
    }
  } catch (error) {
    // Không làm gì, cho phép tiếp tục
    console.warn('⚠️ optionalAuth: token không hợp lệ, bỏ qua xác thực');
  } finally {
    next();
  }
};

module.exports = { auth, optionalAuth };
