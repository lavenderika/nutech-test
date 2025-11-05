const multer = require('multer');
const path = require('path');

// configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profile/'); // directory
  },
  filename: function (req, file, cb) {
    // generate unique filename: timestamp + original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'profile-' + uniqueSuffix + ext);
  }
});

// file filter to only allow jpeg and png
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg','image/png'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format Image tidak sesuai'), false);
  }
};

// configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5mb limit
  }
});

// middleware to handle single file upload
const uploadProfileImage = upload.single('file');

// error handling middleware
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: 102,
        message: 'Format Image tidak sesuai',
        data: null
      });
    }
  }
  
  if (err.message === 'Format Image tidak sesuai') {
    return res.status(400).json({
      status: 102,
      message: 'Format Image tidak sesuai',
      data: null
    });
  }
  
  next(err);
};

module.exports = {
  uploadProfileImage,
  handleUploadError
};

