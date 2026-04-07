const router = require('express').Router();
const {
  getDashboard, getAllOrders, getAllUsers,
  toggleUserStatus, updateUserRole,
} = require('../controllers/admin.controller');
const { protect, isAdmin } = require('../middleware/auth');

router.use(protect, isAdmin); // all admin routes protected

router.get('/dashboard',           getDashboard);
router.get('/orders',              getAllOrders);
router.get('/users',               getAllUsers);
router.put('/users/:id/toggle',    toggleUserStatus);
router.put('/users/:id/role',      updateUserRole);

module.exports = router;
