const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const transactionController = require('../controllers/transactionController');

router.post('/', authenticateToken, transactionController.createPayment);
router.get('/history', authenticateToken, transactionController.getHistory);

module.exports = router;
