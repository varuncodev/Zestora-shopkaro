const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');

// @GET /api/products  — search, filter, sort, paginate
const getProducts = asyncHandler(async (req, res) => {
  const {
    keyword, category, minPrice, maxPrice,
    rating, sort = '-createdAt', page = 1, limit = 12, featured,
  } = req.query;

  const query = {};

  if (keyword) {
    query.$text = { $search: keyword };
  }
  if (category)  query.category = category;
  if (featured)  query.featured = true;
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }
  if (rating) query.rating = { $gte: Number(rating) };

  const total = await Product.countDocuments(query);
  const pages = Math.ceil(total / limit);
  const skip  = (page - 1) * limit;

  const products = await Product.find(query)
    .sort(sort)
    .skip(skip)
    .limit(Number(limit))
    .lean();

  res.json({
    success: true,
    products,
    page: Number(page),
    pages,
    total,
  });
});

// @GET /api/products/:id
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('reviews.user', 'name avatar');
  if (!product) { res.status(404); throw new Error('Product not found'); }
  res.json({ success: true, product });
});

// @POST /api/products  (admin)
const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json({ success: true, product });
});

// @PUT /api/products/:id  (admin)
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true,
  });
  if (!product) { res.status(404); throw new Error('Product not found'); }
  res.json({ success: true, product });
});

// @DELETE /api/products/:id  (admin)
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }
  res.json({ success: true, message: 'Product deleted' });
});

// @POST /api/products/:id/reviews
const createReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }

  const alreadyReviewed = product.reviews.find(r => r.user.toString() === req.user._id.toString());
  if (alreadyReviewed) { res.status(400); throw new Error('Already reviewed this product'); }

  product.reviews.push({ user: req.user._id, name: req.user.name, rating: Number(rating), comment });
  product.numReviews = product.reviews.length;
  product.rating = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;

  await product.save();
  res.status(201).json({ success: true, message: 'Review added' });
});

// @GET /api/products/categories
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct('category');
  res.json({ success: true, categories });
});

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct, createReview, getCategories };
