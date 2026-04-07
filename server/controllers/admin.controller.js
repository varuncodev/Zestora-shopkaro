const asyncHandler = require('express-async-handler');
const Order   = require('../models/Order');
const Product = require('../models/Product');
const User    = require('../models/User');

// @GET /api/admin/dashboard
const getDashboard = asyncHandler(async (req, res) => {
  const [totalOrders, totalProducts, totalUsers, revenueData, recentOrders, lowStock] = await Promise.all([
    Order.countDocuments(),
    Product.countDocuments(),
    User.countDocuments({ role: 'user' }),
    Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
    Order.find().sort('-createdAt').limit(5).populate('user', 'name email'),
    Product.find({ stock: { $lt: 10 } }).select('name stock category').limit(10),
  ]);

  // Monthly revenue (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyRevenue = await Order.aggregate([
    { $match: { isPaid: true, createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
        revenue: { $sum: '$totalPrice' },
        orders:  { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  // Orders by status
  const ordersByStatus = await Order.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  res.json({
    success: true,
    stats: {
      totalOrders,
      totalProducts,
      totalUsers,
      totalRevenue: revenueData[0]?.total || 0,
    },
    monthlyRevenue,
    ordersByStatus,
    recentOrders,
    lowStock,
  });
});

// @GET /api/admin/orders
const getAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = status ? { status } : {};

  const total  = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate('user', 'name email');

  res.json({ success: true, orders, total, pages: Math.ceil(total / limit) });
});

// @GET /api/admin/users
const getAllUsers = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  const query = { role: { $ne: 'admin' } };
  if (search) query.$or = [
    { name: new RegExp(search, 'i') },
    { email: new RegExp(search, 'i') },
  ];

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .select('-password -refreshToken');

  res.json({ success: true, users, total, pages: Math.ceil(total / limit) });
});

// @PUT /api/admin/users/:id/toggle
const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('User not found'); }
  if (user.role === 'admin') { res.status(403); throw new Error('Cannot modify admin'); }

  user.isActive = !user.isActive;
  await user.save();

  res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
});

// @PUT /api/admin/users/:id/role
const updateUserRole = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role: req.body.role },
    { new: true }
  );
  if (!user) { res.status(404); throw new Error('User not found'); }
  res.json({ success: true, user });
});

module.exports = { getDashboard, getAllOrders, getAllUsers, toggleUserStatus, updateUserRole };
