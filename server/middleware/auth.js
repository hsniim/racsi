const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticate = (req, res, next) => {
  // Ambil token dari header Authorization
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // Cek jika token tidak ada
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    // Verifikasi token dengan kunci rahasia
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Simpan data decoded (misalnya id_admin) ke req untuk digunakan di controller
    next(); // Lanjut ke controller jika sukses
  } catch (error) {
    console.error('Token verification error:', error.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = { authenticate };