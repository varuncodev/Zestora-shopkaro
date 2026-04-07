const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:    { type: String, required: true },
  rating:  { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: {
    type: String, required: [true, 'Product name required'], trim: true, maxlength: 200,
  },
  description: { type: String, required: [true, 'Description required'] },
  price: {
    type: Number, required: [true, 'Price required'], min: 0,
  },
  discountPrice: { type: Number, default: 0 },
  category: {
    type: String,
    required: [true, 'Category required'],
    enum: ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Beauty', 'Toys', 'Other'],
  },
  brand:  { type: String, default: '' },
  images: [{ public_id: String, url: String }],
  stock:  { type: Number, required: true, default: 0, min: 0 },
  reviews: [reviewSchema],
  rating:      { type: Number, default: 0 },
  numReviews:  { type: Number, default: 0 },
  featured:    { type: Boolean, default: false },
  isSoldOut:   { type: Boolean, default: false },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
});

// Text search index
productSchema.index({ name: 'text', description: 'text', brand: 'text' });
// Performance indexes
productSchema.index({ category: 1, price: 1 });
productSchema.index({ rating: -1 });

module.exports = mongoose.model('Product', productSchema);
