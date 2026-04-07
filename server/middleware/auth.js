const asyncHandler = require('express-async-handler');
const { verifyAccessToken } = require('../utils/generateToken');
const User = require('../models/User');

// Verify JWT and attach user to req
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized — no token');
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = await User.findById(decoded.id).select('-password -refreshToken');

    if (!req.user) {
      res.status(401);
      throw new Error('User not found');
    }

    if (!req.user.isActive) {
      res.status(403);
      throw new Error('Account has been deactivated');
    }

    next();
  } catch (error) {
    res.status(401);
    throw new Error('Not authorized — invalid token');
  }
});

// Admin only
const isAdmin = (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  res.status(403);
  throw new Error('Admin access required');
};

// Optional auth (for guest cart, public product pages)
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
    try {
      const decoded = verifyAccessToken(token);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (_) {
      req.user = null;
    }
  }
  next();
});

module.exports = { protect, isAdmin, optionalAuth };
