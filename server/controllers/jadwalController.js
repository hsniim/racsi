const pool = require('../config/db');

const getAllJadwal = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM jadwal');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jadwal', error });
  }
};

module.exports = {getAllJadwal};