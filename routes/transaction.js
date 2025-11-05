const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const transactionController = require('../controllers/transactionController');

router.get('/', authenticateToken, transactionController.getBalance);
router.post('/', authenticateToken, transactionController.topUp);
router.post('/transaction', (req, res) => {
  res.json({ status: 0, message: 'Transaction endpoint - coming soon', data: null });
});

router.get('/transaction/history', (req, res) => {
  res.json({ status: 0, message: 'Transaction history endpoint - coming soon', data: null });
});

module.exports = router;

