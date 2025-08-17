const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // Sesuaikan dengan port frontend
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// Routes
const adminRoutes = require('./routes/adminRoutes');
const gedungRoutes = require('./routes/gedungRoutes');
const lantaiRoutes = require('./routes/lantaiRoutes');
const ruanganRoutes = require('./routes/ruanganRoutes');
const kegiatanRoutes = require('./routes/kegiatanRoutes');
const jadwalRoutes = require('./routes/jadwalRoutes');
app.use('/api', adminRoutes);
app.use('/api', gedungRoutes);
app.use('/api', lantaiRoutes);
app.use('/api', ruanganRoutes);
app.use('/api', kegiatanRoutes);
app.use('/api', jadwalRoutes);

// Routes TV
const tvRoutes = require('./routes/tvRoutes');
app.use('/api', tvRoutes);
// Socket.IO
io.on('connection', (socket) => {
  console.log('Client connected');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const cron = require('node-cron');
const pool = require('./config/db');

cron.schedule('0 0 * * *', async () => {
  try {
    const [expiredJadwal] = await pool.query('SELECT * FROM jadwal WHERE tanggal < CURDATE()');
    for (const j of expiredJadwal) {
      await pool.query('DELETE FROM jadwal WHERE id_jadwal = ?', [j.id_jadwal]);
      await pool.query('DELETE FROM kegiatan WHERE id_kegiatan = ?', [j.id_kegiatan]);
      await pool.query('UPDATE ruangan SET status = "tidak_digunakan" WHERE id_ruangan = ?', [j.id_ruangan]);
    }
    console.log('Cleaned up expired schedules');
  } catch (error) {
    console.error('Cron error:', error);
  }
});

const PORT = process.env.PORT || 5000;
app.get('/', (req, res) => {
  res.send('Server is running...');
});
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});