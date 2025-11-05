const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const informationController = require('../controllers/informationController');

router.get('/', authenticateToken, informationController.getServices);

module.exports = router;
