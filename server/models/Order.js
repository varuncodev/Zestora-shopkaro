const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:     { type: String, required: true },
  image:    { type: String },
  price:    { type: Number, required: true },
  qty:      { type: Number, required: true, min: 1 },
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  shippingAddress: {
    name:    { type: String, required: true },
    street:  { type: String, required: true },
    city:    { type: String, required: true },
    state:   { type: String, required: true },
    zip:     { type: String, required: true },
    country: { type: String, required: true },
    phone:   { type: String, required: true },
  },
  paymentMethod: { type: String, default: 'stripe' },
  paymentResult: {
    id:         String,
    status:     String,
    update_time: String,
    email:      String,
  },
  subtotal:      { type: Number, required: true },
  taxPrice:      { type: Number, required: true, default: 0 },
  shippingPrice: { type: Number, required: true, default: 0 },
  totalPrice:    { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending',
  },
  stripePaymentIntentId: { type: String },
  isPaid:       { type: Boolean, default: false },
  paidAt:       Date,
  isDelivered:  { type: Boolean, default: false },
  deliveredAt:  Date,
  trackingNumber: { type: String },
  notes:   { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
