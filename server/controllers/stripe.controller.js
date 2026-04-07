const asyncHandler = require('express-async-handler');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const Product = require('../models/Product');
const { sendEmail, orderConfirmationEmail } = require('../utils/sendEmail');

// @POST /api/payments/create-payment-intent
const createPaymentIntent = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  const order = await Order.findById(orderId);
  if (!order) { res.status(404); throw new Error('Order not found'); }

  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403); throw new Error('Not authorized');
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount:   Math.round(order.totalPrice * 100), // paise (INR)
    currency: 'inr',
    metadata: {
      orderId:  order._id.toString(),
      userId:   req.user._id.toString(),
    },
  });

  // Save intent ID
  order.stripePaymentIntentId = paymentIntent.id;
  await order.save();

  res.json({
    success: true,
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  });
});

// @POST /api/payments/webhook  — Stripe sends events here
const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const { orderId } = paymentIntent.metadata;

    try {
      const order = await Order.findById(orderId).populate('user', 'name email');
      if (order && !order.isPaid) {
        order.isPaid        = true;
        order.paidAt        = new Date();
        order.status        = 'paid';
        order.paymentResult = {
          id:          paymentIntent.id,
          status:      paymentIntent.status,
          update_time: new Date().toISOString(),
          email:       paymentIntent.receipt_email,
        };

        // Decrement stock
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.qty } });
        }

        await order.save();
        await sendEmail(orderConfirmationEmail(order, order.user));
        console.log(`Order ${orderId} marked as paid via webhook`);
      }
    } catch (err) {
      console.error('Webhook order update failed:', err.message);
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const { orderId } = event.data.object.metadata;
    await Order.findByIdAndUpdate(orderId, { status: 'cancelled' });
    console.log(`Order ${orderId} payment failed`);
  }

  res.json({ received: true });
};

// @POST /api/payments/refund  (admin)
const createRefund = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  const order = await Order.findById(orderId);
  if (!order) { res.status(404); throw new Error('Order not found'); }
  if (!order.stripePaymentIntentId) { res.status(400); throw new Error('No payment found for this order'); }

  const refund = await stripe.refunds.create({
    payment_intent: order.stripePaymentIntentId,
  });

  order.status = 'refunded';
  await order.save();

  res.json({ success: true, refund });
});

module.exports = { createPaymentIntent, stripeWebhook, createRefund };
