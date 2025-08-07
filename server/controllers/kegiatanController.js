const pool = require('../config/db');

const getAllKegiatan = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM kegiatan');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching kegiatan', error });
  }
};

module.exports = {getAllKegiatan};