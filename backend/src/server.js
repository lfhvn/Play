const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/rapids', require('./routes/rapids'));
app.use('/api/discussions', require('./routes/discussions'));
app.use('/api/photos', require('./routes/photos'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Whitewater Rapids API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🌊 Whitewater Rapids API running on port ${PORT}`);
});
