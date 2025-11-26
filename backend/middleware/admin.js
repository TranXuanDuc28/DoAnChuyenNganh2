const { auth } = require('./auth');

// Admin middleware - requires authentication and admin role
const adminAuth = (req, res, next) => {
  // First check authentication
  auth(req, res, (err) => {
    if (err) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Then check if user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    next();
  });
};

module.exports = { adminAuth };

