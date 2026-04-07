const router = require('express').Router();
const { createPaymentIntent, stripeWebhook, createRefund } = require('../controllers/stripe.controller');
const { protect, isAdmin } = require('../middleware/auth');

// Webhook uses raw body — no protect middleware
router.post('/webhook',               stripeWebhook);
router.post('/create-payment-intent', protect, createPaymentIntent);
router.post('/refund',                protect, isAdmin, createRefund);

module.exports = router;
