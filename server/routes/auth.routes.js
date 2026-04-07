const router = require('express').Router();
const { register, login, refreshAccessToken, logout, getMe, updateProfile, forgotPassword, resetPassword } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login',    login);
router.post('/refresh',  refreshAccessToken);
router.post('/logout',   protect, logout);
router.get('/me',        protect, getMe);
router.put('/profile',   protect, updateProfile);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

module.exports = router;
