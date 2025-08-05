const pool = require('../config/db');

const getAllRooms = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM rooms');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rooms', error });
  }
};

module.exports = { getAllRooms };