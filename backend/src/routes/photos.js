const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const pool = require('../config/database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'rapid-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get photos for a rapid
router.get('/rapid/:rapidId', optionalAuth, async (req, res) => {
  try {
    const { rapidId } = req.params;

    const result = await pool.query(
      `SELECT
        p.id,
        p.filename,
        p.caption,
        p.flow_level,
        p.taken_at,
        p.created_at,
        u.id as user_id,
        u.username,
        u.profile_picture
      FROM photos p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.rapid_id = $1
      ORDER BY p.created_at DESC`,
      [rapidId]
    );

    res.json({
      count: result.rows.length,
      photos: result.rows,
    });
  } catch (error) {
    console.error('Error fetching photos:', error);
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
});

// Upload photo
router.post('/', authenticateToken, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No photo uploaded' });
    }

    const { rapid_id, caption, flow_level, taken_at } = req.body;

    if (!rapid_id) {
      return res.status(400).json({ error: 'Rapid ID is required' });
    }

    const result = await pool.query(
      `INSERT INTO photos (rapid_id, user_id, filename, caption, flow_level, taken_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [rapid_id, req.user.id, req.file.filename, caption, flow_level, taken_at]
    );

    res.status(201).json({
      message: 'Photo uploaded successfully',
      photo: result.rows[0],
    });
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
});

// Delete photo (only by uploader)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM photos WHERE id = $1 AND user_id = $2 RETURNING filename',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Photo not found or unauthorized' });
    }

    // Could add file deletion from filesystem here
    // fs.unlinkSync(path.join(__dirname, '../../public/uploads/', result.rows[0].filename));

    res.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
});

module.exports = router;
