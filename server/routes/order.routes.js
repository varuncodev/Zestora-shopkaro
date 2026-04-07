const router = require('express').Router();
const {
  createOrder, getMyOrders, getOrderById,
  updateOrderToPaid, updateOrderToShipped,
  updateOrderToDelivered, cancelOrder,
} = require('../controllers/order.controller');
const { protect, isAdmin } = require('../middleware/auth');

router.post('/',           protect, createOrder);
router.get('/my',          protect, getMyOrders);
router.get('/:id',         protect, getOrderById);
router.put('/:id/pay',     protect, updateOrderToPaid);
router.put('/:id/ship',    protect, isAdmin, updateOrderToShipped);
router.put('/:id/deliver', protect, isAdmin, updateOrderToDelivered);
router.put('/:id/cancel',  protect, cancelOrder);

module.exports = router;
