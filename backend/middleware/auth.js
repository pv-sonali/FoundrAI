const jwt = require('jsonwebtoken');
const User = require('../models/User');
const rateLimit = require('express-rate-limit');

if (!process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET environment variable is not set. Using a fallback secret is insecure for production!');
}
const JWT_SECRET = process.env.JWT_SECRET || 'foundr_ai_secret_key_12345';

// Verify JWT token middleware
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(404).json({ success: false, message: 'No user found with this id.' });
    }
    next();
  } catch (err) {
    console.error('Auth verification error:', err);
    return res.status(401).json({ success: false, message: 'Not authorized. Token invalid or expired.' });
  }
};

// Authorize roles (RBAC) middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user ? req.user.role : 'guest'}' is not authorized to access this resource.`,
      });
    }
    next();
  }
};

// Rate limiting middleware
const rateLimiter = (limit = 100, windowMs = 15 * 60 * 1000) => {
  return rateLimit({
    windowMs,
    max: limit,
    message: { success: false, message: 'Too many requests. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

module.exports = { protect, authorize, rateLimiter, JWT_SECRET };
