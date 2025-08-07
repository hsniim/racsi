const pool = require('../config/db');

const getAllLantai = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM lantai');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching lantai', error });
  }
};

module.exports = {getAllLantai};