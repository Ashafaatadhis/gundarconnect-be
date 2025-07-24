const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const sequelize = require('./config/database');
const { Post, Comment } = require('./models/Post');
const User = require('./models/User');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const profileRoutes = require('./routes/profile');
const savedRoutes = require('./routes/saved');
// const searchRoutes = require('./routes/search');
const searchRoutes = require('./routes/search');
const aboutRoutes = require('./routes/about');
const notificationsRoutes = require('./routes/notifications');
const followRoutes = require('./routes/followRoutes');
const app = express();

app.use(express.json());
// ✅ Middleware: aktifkan CORS terlebih dahulu
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));
app.use('/api/follow', followRoutes)
app.use(bodyParser.json());
app.use('/api', followRoutes);
app.use('/api/follow', require('./routes/followRoutes'))
// ✅ Static folder
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/saved', savedRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/search', searchRoutes);
// app.use('/api/search', require('./routes/search'));

// ✅ Socket.io setup
const http = require('http');
const socketIo = require('socket.io');

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ['http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socket.on('identify', (userId) => {
    socket.join(`user_${userId}`);
  });
});

// ✅ Simpan io instance di app
app.set('io', io);

// ✅ Sync database
sequelize.sync().then(() => {
  console.log('Database synced');
  
  // ✅ Jalankan server
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });
});