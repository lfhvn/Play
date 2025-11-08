const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

// Get all discussions for a rapid
router.get('/rapid/:rapidId', optionalAuth, async (req, res) => {
  try {
    const { rapidId } = req.params;

    const result = await pool.query(
      `SELECT
        d.id,
        d.title,
        d.content,
        d.is_trip_report,
        d.run_date,
        d.flow_level,
        d.created_at,
        d.updated_at,
        u.id as user_id,
        u.username,
        u.profile_picture,
        COUNT(dr.id) as reply_count
      FROM discussions d
      LEFT JOIN users u ON d.user_id = u.id
      LEFT JOIN discussion_replies dr ON d.id = dr.discussion_id
      WHERE d.rapid_id = $1
      GROUP BY d.id, u.id, u.username, u.profile_picture
      ORDER BY d.created_at DESC`,
      [rapidId]
    );

    res.json({
      count: result.rows.length,
      discussions: result.rows,
    });
  } catch (error) {
    console.error('Error fetching discussions:', error);
    res.status(500).json({ error: 'Failed to fetch discussions' });
  }
});

// Get single discussion with replies
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Get discussion
    const discussionResult = await pool.query(
      `SELECT
        d.id,
        d.rapid_id,
        d.title,
        d.content,
        d.is_trip_report,
        d.run_date,
        d.flow_level,
        d.created_at,
        d.updated_at,
        u.id as user_id,
        u.username,
        u.profile_picture,
        r.name as rapid_name
      FROM discussions d
      LEFT JOIN users u ON d.user_id = u.id
      LEFT JOIN rapids r ON d.rapid_id = r.id
      WHERE d.id = $1`,
      [id]
    );

    if (discussionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Discussion not found' });
    }

    // Get replies
    const repliesResult = await pool.query(
      `SELECT
        dr.id,
        dr.content,
        dr.parent_reply_id,
        dr.created_at,
        dr.updated_at,
        u.id as user_id,
        u.username,
        u.profile_picture
      FROM discussion_replies dr
      LEFT JOIN users u ON dr.user_id = u.id
      WHERE dr.discussion_id = $1
      ORDER BY dr.created_at ASC`,
      [id]
    );

    res.json({
      discussion: discussionResult.rows[0],
      replies: repliesResult.rows,
    });
  } catch (error) {
    console.error('Error fetching discussion:', error);
    res.status(500).json({ error: 'Failed to fetch discussion' });
  }
});

// Create new discussion
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { rapid_id, title, content, is_trip_report, run_date, flow_level } = req.body;

    if (!rapid_id || !title || !content) {
      return res.status(400).json({ error: 'Rapid ID, title, and content are required' });
    }

    const result = await pool.query(
      `INSERT INTO discussions (rapid_id, user_id, title, content, is_trip_report, run_date, flow_level)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [rapid_id, req.user.id, title, content, is_trip_report || false, run_date, flow_level]
    );

    res.status(201).json({
      message: 'Discussion created successfully',
      discussion: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating discussion:', error);
    res.status(500).json({ error: 'Failed to create discussion' });
  }
});

// Create reply to discussion
router.post('/:id/reply', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { content, parent_reply_id } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const result = await pool.query(
      `INSERT INTO discussion_replies (discussion_id, user_id, content, parent_reply_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id, req.user.id, content, parent_reply_id || null]
    );

    res.status(201).json({
      message: 'Reply created successfully',
      reply: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating reply:', error);
    res.status(500).json({ error: 'Failed to create reply' });
  }
});

// Delete discussion (only by author)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM discussions WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Discussion not found or unauthorized' });
    }

    res.json({ message: 'Discussion deleted successfully' });
  } catch (error) {
    console.error('Error deleting discussion:', error);
    res.status(500).json({ error: 'Failed to delete discussion' });
  }
});

module.exports = router;
