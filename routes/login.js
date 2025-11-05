const express = require('express');
const router = express.Router();
const membershipController = require('../controllers/membershipController');

router.post('/', membershipController.login);

module.exports = router;

