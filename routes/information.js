const express = require('express');
const router = express.Router();
const informationController = require('../controllers/informationController');

router.get('/', informationController.getBanners);

module.exports = router;

