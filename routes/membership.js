const express = require('express');
const router = express.Router();
const membershipController = require('../controllers/membershipController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { uploadProfileImage, handleUploadError } = require('../middleware/uploadMiddleware');

router.post('/', membershipController.registration);
router.get('/', authenticateToken, membershipController.getProfile);
router.put('/update', authenticateToken, membershipController.updateProfile);
router.put('/image', authenticateToken, uploadProfileImage, handleUploadError, membershipController.updateProfileImage);

module.exports = router;

