const express = require('express');
const dotenv = require('dotenv');
const membershipRoutes = require('./routes/membership');
const loginRoutes = require('./routes/login');
const bannerRoutes = require('./routes/banner');
const servicesRoutes = require('./routes/services');
const transactionRoutes = require('./routes/transaction');
const paymentRoutes = require('./routes/payment');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// routes
app.use('/registration', membershipRoutes);
app.use('/login', loginRoutes);
app.use('/profile', membershipRoutes);
app.use('/banner', bannerRoutes);
app.use('/services', servicesRoutes);
app.use('/balance', transactionRoutes);
app.use('/topup', transactionRoutes);
app.use('/transaction', paymentRoutes);

// health check
app.get('/', (req, res) => {
  res.json({
    status: 0,
    message: 'API is running',
    data: null
  });
});

// error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 500,
    message: 'Internal server error',
    data: null
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;

