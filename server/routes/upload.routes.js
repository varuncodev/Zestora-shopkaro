const router = require('express').Router();
const { upload, cloudinary } = require('../config/cloudinary');
const { protect, isAdmin } = require('../middleware/auth');
const asyncHandler = require('express-async-handler');

// @POST /api/upload/product  — upload up to 5 product images
router.post('/product', protect, isAdmin, upload.array('images', 5), asyncHandler(async (req, res) => {
  if (!req.files?.length) { res.status(400); throw new Error('No files uploaded'); }

  const images = req.files.map(f => ({
    public_id: f.filename,
    url: f.path,
  }));

  res.json({ success: true, images });
}));

// @DELETE /api/upload/:public_id  — delete image from Cloudinary
router.delete('/:public_id', protect, isAdmin, asyncHandler(async (req, res) => {
  await cloudinary.uploader.destroy(`ecommerce/products/${req.params.public_id}`);
  res.json({ success: true, message: 'Image deleted' });
}));

module.exports = router;
