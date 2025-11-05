const db = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const registration = async (req, res) => {
  let connection = null;
  
  try {
    const { email, first_name, last_name, password } = req.body;

    // debug: log request body (remove in production)
    console.log('Request body:', req.body);
    console.log('Email received:', email, 'Type:', typeof email);

    // trim fields to remove whitespace
    const trimmedEmail = email ? String(email).trim() : '';
    const trimmedFirstName = first_name ? String(first_name).trim() : '';
    const trimmedPassword = password ? String(password).trim() : '';

    // validate email is not empty
    if (!trimmedEmail) {
      return res.status(400).json({
        status: 102,
        message: 'Parameter email tidak sesuai format',
        data: null
      });
    }

    // validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      console.log('Email validation failed. Email:', trimmedEmail);
      return res.status(400).json({
        status: 102,
        message: 'Parameter email tidak sesuai format',
        data: null
      });
    }

    // validate first_name is not empty
    if (!trimmedFirstName) {
      return res.status(400).json({
        status: 104,
        message: 'Parameter tidak lengkap',
        data: null
      });
    }

    // validate password is not empty
    if (!trimmedPassword) {
      return res.status(400).json({
        status: 103,
        message: 'Password harus minimal 8 karakter',
        data: null
      });
    }

    // validate password length (minimum 8 characters)
    if (trimmedPassword.length < 8) {
      return res.status(400).json({
        status: 103,
        message: 'Password harus minimal 8 karakter',
        data: null
      });
    }

    // validate required fields (last_name)
    if (!last_name) {
      return res.status(400).json({
        status: 104,
        message: 'Parameter tidak lengkap',
        data: null
      });
    }

    // get database connection after validation
    connection = await db.getConnection();

    // check if email already exists
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [trimmedEmail]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        status: 105,
        message: 'Email sudah terdaftar',
        data: null
      });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(trimmedPassword, 10);

    // insert user using prepared statement
    await connection.beginTransaction();

    const [insertResult] = await connection.execute(
      'INSERT INTO users (email, first_name, last_name, password) VALUES (?, ?, ?, ?)',
      [trimmedEmail, trimmedFirstName, last_name, hashedPassword]
    );

    const userId = insertResult.insertId;

    // create initial balance for user
    await connection.execute(
      'INSERT INTO balances (user_id, balance) VALUES (?, ?)',
      [userId, 0.00]
    );

    await connection.commit();

    // success response
    return res.status(200).json({
      status: 0,
      message: 'Registrasi berhasil silahkan login',
      data: null
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Registration error:', error);
    
    // handle duplicate email error
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        status: 105,
        message: 'Email sudah terdaftar',
        data: null
      });
    }

    return res.status(500).json({
      status: 500,
      message: 'Internal server error',
      data: null
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

const login = async (req, res) => {
  let connection = null;
  
  try {
    const { email, password } = req.body;

    // trim fields to remove whitespace
    const trimmedEmail = email ? String(email).trim() : '';
    const trimmedPassword = password ? String(password).trim() : '';

    // validate email is not empty
    if (!trimmedEmail) {
      return res.status(400).json({
        status: 102,
        message: 'Parameter email tidak sesuai format',
        data: null
      });
    }

    // validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({
        status: 102,
        message: 'Parameter email tidak sesuai format',
        data: null
      });
    }

    // validate password is not empty
    if (!trimmedPassword) {
      return res.status(400).json({
        status: 103,
        message: 'Password harus minimal 8 karakter',
        data: null
      });
    }

    // validate password length (minimum 8 characters)
    if (trimmedPassword.length < 8) {
      return res.status(400).json({
        status: 103,
        message: 'Password harus minimal 8 karakter',
        data: null
      });
    }

    // get database connection
    connection = await db.getConnection();

    // find user by email
    const [users] = await connection.execute(
      'SELECT id, email, password FROM users WHERE email = ?',
      [trimmedEmail]
    );

    if (users.length === 0) {
      return res.status(401).json({
        status: 103,
        message: 'Username atau password salah',
        data: null
      });
    }

    const user = users[0];

    // verify password
    const isPasswordValid = await bcrypt.compare(trimmedPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: 103,
        message: 'Username atau password salah',
        data: null
      });
    }

    // generate jwt token with 12 hours expiration
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-here';
    const token = jwt.sign(
      { email: user.email },
      jwtSecret,
      { expiresIn: '12h' }
    );

    // success response
    return res.status(200).json({
      status: 0,
      message: 'Login Sukses',
      data: {
        token: token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    
    return res.status(500).json({
      status: 500,
      message: 'Internal server error',
      data: null
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

const getProfile = async (req, res) => {
  let connection = null;
  
  try {
    // get email from jwt payload (set by authMiddleware)
    const email = req.user.email;

    if (!email) {
      return res.status(401).json({
        status: 108,
        message: 'Token tidak tidak valid atau kadaluwarsa',
        data: null
      });
    }

    // get database connection
    connection = await db.getConnection();

    // get user profile by email
    const [users] = await connection.execute(
      'SELECT email, first_name, last_name, profile_image FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        status: 108,
        message: 'Token tidak tidak valid atau kadaluwarsa',
        data: null
      });
    }

    const user = users[0];

    // format profile image url (if null, set to null, otherwise use the stored value)
    const profileImage = user.profile_image || null;

    // success response
    return res.status(200).json({
      status: 0,
      message: 'Sukses',
      data: {
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        profile_image: profileImage
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    
    return res.status(500).json({
      status: 500,
      message: 'Internal server error',
      data: null
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

const updateProfile = async (req, res) => {
  let connection = null;
  
  try {
    // get email from jwt payload (set by authMiddleware)
    const email = req.user.email;

    if (!email) {
      return res.status(401).json({
        status: 108,
        message: 'Token tidak tidak valid atau kadaluwarsa',
        data: null
      });
    }

    const { first_name, last_name } = req.body;

    // trim fields to remove whitespace
    const trimmedFirstName = first_name ? String(first_name).trim() : '';
    const trimmedLastName = last_name ? String(last_name).trim() : '';

    // validate first_name is not empty
    if (!trimmedFirstName) {
      return res.status(400).json({
        status: 104,
        message: 'Parameter tidak lengkap',
        data: null
      });
    }

    // validate last_name is not empty
    if (!trimmedLastName) {
      return res.status(400).json({
        status: 104,
        message: 'Parameter tidak lengkap',
        data: null
      });
    }

    // get database connection
    connection = await db.getConnection();

    // update user profile using prepared statement
    await connection.execute(
      'UPDATE users SET first_name = ?, last_name = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ?',
      [trimmedFirstName, trimmedLastName, email]
    );

    // get updated user profile
    const [users] = await connection.execute(
      'SELECT email, first_name, last_name, profile_image FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        status: 108,
        message: 'Token tidak tidak valid atau kadaluwarsa',
        data: null
      });
    }

    const user = users[0];

    // format profile image url (if null, set to null, otherwise use the stored value)
    const profileImage = user.profile_image || null;

    // success response
    return res.status(200).json({
      status: 0,
      message: 'Update Pofile berhasil',
      data: {
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        profile_image: profileImage
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    
    return res.status(500).json({
      status: 500,
      message: 'Internal server error',
      data: null
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

const updateProfileImage = async (req, res) => {
  let connection = null;
  
  try {
    // get email from JWT payload (set by authMiddleware)
    const email = req.user.email;

    if (!email) {
      return res.status(401).json({
        status: 108,
        message: 'Token tidak tidak valid atau kadaluwarsa',
        data: null
      });
    }

    // check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        status: 102,
        message: 'Format Image tidak sesuai',
        data: null
      });
    }

    // get database connection
    connection = await db.getConnection();

    // generate profile imageurl
    // in prod, this should be a full url to file storage/cdn
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const profileImageUrl = `${baseUrl}/uploads/profile/${req.file.filename}`;

    // update user profile image using prepared statement
    await connection.execute(
      'UPDATE users SET profile_image = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ?',
      [profileImageUrl, email]
    );

    // fgt updated user profile
    const [users] = await connection.execute(
      'SELECT email, first_name, last_name, profile_image FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        status: 108,
        message: 'Token tidak tidak valid atau kadaluwarsa',
        data: null
      });
    }

    const user = users[0];

    // success response
    return res.status(200).json({
      status: 0,
      message: 'Update Profile Image berhasil',
      data: {
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        profile_image: user.profile_image
      }
    });

  } catch (error) {
    console.error('Update profile image error:', error);
    
    return res.status(500).json({
      status: 500,
      message: 'Internal server error',
      data: null
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

module.exports = {
  registration,
  login,
  getProfile,
  updateProfile,
  updateProfileImage
};

