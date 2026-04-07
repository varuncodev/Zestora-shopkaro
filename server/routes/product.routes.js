const router = require('express').Router();
const {
  getProducts, getProductById, createProduct,
  updateProduct, deleteProduct, createReview, getCategories,
} = require('../controllers/product.controller');
const { protect, isAdmin } = require('../middleware/auth');

router.get('/',             getProducts);
router.get('/categories',   getCategories);
router.get('/:id',          getProductById);
router.post('/:id/reviews', protect, createReview);
router.post('/',            protect, isAdmin, createProduct);
router.put('/:id',          protect, isAdmin, updateProduct);
router.delete('/:id',       protect, isAdmin, deleteProduct);

module.exports = router;
