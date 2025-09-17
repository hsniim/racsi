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
const agendaRoutes = require("./routes/agendaRoutes");
const tvRoutes = require('./routes/tvRoutes');
const riwayatRoutes = require('./routes/riwayatRoutes');
const headerRoutes = require('./routes/headerRoutes');
const pjLantaiRoutes = require("./routes/pjLantaiRoutes");
const pjGedungRoutes = require("./routes/pjGedungRoutes");
const tvDeviceRoutes = require('./routes/tvDeviceRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

app.use('/api', adminRoutes);
app.use('/api/gedung', gedungRoutes);
app.use('/api/lantai', lantaiRoutes);
app.use('/api/', ruanganRoutes);  
app.use("/api/agenda", agendaRoutes);
app.use('/api/tv', tvRoutes);
app.use('/api/', riwayatRoutes);
app.use('/api/', headerRoutes);
app.use("/api/pj-lantai", pjLantaiRoutes);
app.use("/api/pj-gedung", pjGedungRoutes);
app.use('/api', tvDeviceRoutes);
app.use('/api/feedback', feedbackRoutes);

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