const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payment');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
app.use('/thumbnails', express.static(path.join(__dirname, '../public/thumbnails')));

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'GrowPDF API is running', timestamp: new Date().toISOString() });
});

const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('/{*path}', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
  console.log('  Serving frontend from dist/');
}

if (!fs.existsSync('./public/uploads')) fs.mkdirSync('./public/uploads', { recursive: true });
if (!fs.existsSync('./public/thumbnails')) fs.mkdirSync('./public/thumbnails', { recursive: true });
if (!fs.existsSync('./data')) fs.mkdirSync('./data', { recursive: true });

app.use((err, req, res, next) => {
  console.error('Server Error:', err.message, err.code);
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'File too large. PDF max 50MB, images max 5MB.' });
  if (err.name === 'MulterError') return res.status(400).json({ error: err.message });
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('='.repeat(50));
  console.log('  GrowPDF Server is running!');
  console.log(`  API:      http://localhost:${PORT}/api`);
  console.log(`  Frontend: http://localhost:${PORT}`);
  console.log('='.repeat(50));
});

module.exports = app;
