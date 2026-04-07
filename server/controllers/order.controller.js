const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { sendEmail, orderConfirmationEmail, shippingUpdateEmail } = require('../utils/sendEmail');

// @POST /api/orders
const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod = 'stripe' } = req.body;

  if (!items?.length) { res.status(400); throw new Error('No order items'); }

  // Verify stock and get current prices
  const orderItems = [];
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) { res.status(404); throw new Error(`Product ${item.product} not found`); }
    if (product.stock < item.qty) {
      res.status(400); throw new Error(`Insufficient stock for ${product.name}`);
    }
    orderItems.push({
      product: product._id,
      name:    product.name,
      image:   product.images[0]?.url || '',
      price:   product.price,
      qty:     item.qty,
    });
  }

  const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const taxPrice      = Math.round(subtotal * 0.18 * 100) / 100; // 18% GST
  const shippingPrice = subtotal > 499 ? 0 : 49;
  const totalPrice    = subtotal + taxPrice + shippingPrice;

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    subtotal,
    taxPrice,
    shippingPrice,
    totalPrice,
  });

  res.status(201).json({ success: true, order });
});

// @GET /api/orders/my
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort('-createdAt')
    .populate('items.product', 'name images');
  res.json({ success: true, orders });
});

// @GET /api/orders/:id
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('items.product', 'name images');

  if (!order) { res.status(404); throw new Error('Order not found'); }

  // Allow only the order owner or admin
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403); throw new Error('Not authorized');
  }

  res.json({ success: true, order });
});

// @PUT /api/orders/:id/pay  — called after Stripe confirms
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) { res.status(404); throw new Error('Order not found'); }

  order.isPaid          = true;
  order.paidAt          = new Date();
  order.status          = 'paid';
  order.paymentResult   = req.body.paymentResult;

  // Decrement stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.qty } });
  }

  const updated = await order.save();

  // Send confirmation email
  await sendEmail(orderConfirmationEmail(updated, order.user));

  res.json({ success: true, order: updated });
});

// @PUT /api/orders/:id/ship  (admin)
const updateOrderToShipped = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) { res.status(404); throw new Error('Order not found'); }

  order.status         = 'shipped';
  order.trackingNumber = req.body.trackingNumber || '';

  const updated = await order.save();
  await sendEmail(shippingUpdateEmail(updated, order.user));

  res.json({ success: true, order: updated });
});

// @PUT /api/orders/:id/deliver  (admin)
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { isDelivered: true, deliveredAt: new Date(), status: 'delivered' },
    { new: true }
  );
  if (!order) { res.status(404); throw new Error('Order not found'); }
  res.json({ success: true, order });
});

// @PUT /api/orders/:id/cancel
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error('Order not found'); }

  if (!['pending', 'paid'].includes(order.status)) {
    res.status(400); throw new Error('Cannot cancel order at this stage');
  }

  // Restore stock if already paid
  if (order.isPaid) {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.qty } });
    }
  }

  order.status = 'cancelled';
  await order.save();

  res.json({ success: true, message: 'Order cancelled' });
});

module.exports = { createOrder, getMyOrders, getOrderById, updateOrderToPaid, updateOrderToShipped, updateOrderToDelivered, cancelOrder };
