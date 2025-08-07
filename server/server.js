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
// Routes Ruangan
const roomRoutes = require('./routes/roomRoutes');
app.use('/api', roomRoutes);
// Routes Gedung
const gedungRoutes = require('./routes/gedungRoutes');
app.use('/api', gedungRoutes);
// Routes Jadwal
const jadwalRoutes = require('./routes/jadwalRoutes');
app.use('/api', jadwalRoutes);
// Routes Kegiatan
const kegiatanRoutes = require('./routes/kegiatanRoutes');
app.use('/api', kegiatanRoutes);
// Routes lantai
const lantaiRoutes = require('./routes/lantaiRoutes');
app.use('/api', lantaiRoutes);

// Socket.IO
io.on('connection', (socket) => {
  console.log('Client connected');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 5000;
app.get('/', (req, res) => {
  res.send('Server is running...');
});
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

