const pool = require('../config/db');

const getAllGedung = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM gedung');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching gedung', error });
  }
};

module.exports = {getAllGedung};