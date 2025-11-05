const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  try {
    // get token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        status: 108,
        message: 'Token tidak tidak valid atau kadaluwarsa',
        data: null
      });
    }

    // verify token
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-here';
    jwt.verify(token, jwtSecret, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          status: 108,
          message: 'Token tidak tidak valid atau kadaluwarsa',
          data: null
        });
      }

      // attach decoded token (with email) to request object
      req.user = decoded;
      next();
    });
  } catch (error) {
    return res.status(401).json({
      status: 108,
      message: 'Token tidak tidak valid atau kadaluwarsa',
      data: null
    });
  }
};

module.exports = {
  authenticateToken
};

