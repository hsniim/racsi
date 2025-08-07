const pool = require('../config/db');

const getAllRuangan = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM ruangan');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching ruangan', error });
  }
};

module.exports = {getAllRuangan};