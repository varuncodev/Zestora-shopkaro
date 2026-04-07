const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const User = require('../models/User');
const { generateTokens, verifyRefreshToken } = require('../utils/generateToken');
const { sendEmail, passwordResetEmail } = require('../utils/sendEmail');

// @POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400); throw new Error('All fields required');
  }

  const userExists = await User.findOne({ email });
  if (userExists) { res.status(400); throw new Error('Email already registered'); }

  const user = await User.create({ name, email, password });
  const { accessToken, refreshToken } = generateTokens(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  res.status(201).json({
    success: true,
    accessToken,
    refreshToken,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
  });
});

// @POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) { res.status(400); throw new Error('Email and password required'); }

  const user = await User.findOne({ email }).select('+password +refreshToken');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401); throw new Error('Invalid credentials');
  }

  if (!user.isActive) { res.status(403); throw new Error('Account deactivated'); }

  const { accessToken, refreshToken } = generateTokens(user._id);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  res.json({
    success: true,
    accessToken,
    refreshToken,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
  });
});

// @POST /api/auth/refresh
const refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) { res.status(401); throw new Error('Refresh token required'); }

  const decoded = verifyRefreshToken(refreshToken);
  const user = await User.findById(decoded.id).select('+refreshToken');

  if (!user || user.refreshToken !== refreshToken) {
    res.status(401); throw new Error('Invalid refresh token');
  }

  const tokens = generateTokens(user._id);
  user.refreshToken = tokens.refreshToken;
  await user.save({ validateBeforeSave: false });

  res.json({ success: true, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
});

// @POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) { user.refreshToken = null; await user.save({ validateBeforeSave: false }); }
  res.json({ success: true, message: 'Logged out' });
});

// @GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, user });
});

// @PUT /api/auth/profile
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { name, phone, address } = req.body;

  if (name)    user.name    = name;
  if (phone)   user.phone   = phone;
  if (address) user.address = { ...user.address, ...address };

  if (req.body.password) {
    if (!req.body.currentPassword) { res.status(400); throw new Error('Current password required'); }
    const userWithPass = await User.findById(req.user._id).select('+password');
    if (!(await userWithPass.matchPassword(req.body.currentPassword))) {
      res.status(401); throw new Error('Incorrect current password');
    }
    user.password = req.body.password;
  }

  await user.save();
  res.json({ success: true, user });
});

// @POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) { res.status(404); throw new Error('No user with that email'); }

  const resetToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordToken   = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpire  = Date.now() + 10 * 60 * 1000; // 10 mins
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  await sendEmail(passwordResetEmail(resetUrl, user));

  res.json({ success: true, message: 'Reset email sent' });
});

// @PUT /api/auth/reset-password/:token
const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) { res.status(400); throw new Error('Invalid or expired token'); }

  user.password           = req.body.password;
  user.resetPasswordToken  = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  const { accessToken, refreshToken } = generateTokens(user._id);
  res.json({ success: true, accessToken, refreshToken });
});

module.exports = { register, login, refreshAccessToken, logout, getMe, updateProfile, forgotPassword, resetPassword };
