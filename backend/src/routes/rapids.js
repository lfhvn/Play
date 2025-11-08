const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { optionalAuth } = require('../middleware/auth');

// Get all rapids (with optional geospatial filtering)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { lat, lng, radius, difficulty, river } = req.query;

    let query = `
      SELECT
        id,
        name,
        river,
        description,
        ST_Y(location::geometry) as latitude,
        ST_X(location::geometry) as longitude,
        difficulty,
        length_miles,
        gradient_fppm,
        optimal_flow_min,
        optimal_flow_max,
        season,
        hazards,
        access_notes,
        permit_required,
        aw_id
      FROM rapids
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    // Filter by radius around a point
    if (lat && lng && radius) {
      query += ` AND ST_DWithin(
        location,
        ST_SetSRID(ST_MakePoint($${paramCount}, $${paramCount + 1}), 4326)::geography,
        $${paramCount + 2}
      )`;
      params.push(parseFloat(lng), parseFloat(lat), parseFloat(radius) * 1609.34); // Convert miles to meters
      paramCount += 3;
    }

    // Filter by difficulty
    if (difficulty) {
      query += ` AND difficulty = $${paramCount}`;
      params.push(difficulty);
      paramCount++;
    }

    // Filter by river name
    if (river) {
      query += ` AND LOWER(river) LIKE LOWER($${paramCount})`;
      params.push(`%${river}%`);
      paramCount++;
    }

    query += ' ORDER BY name';

    const result = await pool.query(query, params);

    res.json({
      count: result.rows.length,
      rapids: result.rows,
    });
  } catch (error) {
    console.error('Error fetching rapids:', error);
    res.status(500).json({ error: 'Failed to fetch rapids' });
  }
});

// Get single rapid by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT
        id,
        name,
        river,
        description,
        ST_Y(location::geometry) as latitude,
        ST_X(location::geometry) as longitude,
        difficulty,
        length_miles,
        gradient_fppm,
        optimal_flow_min,
        optimal_flow_max,
        season,
        hazards,
        access_notes,
        permit_required,
        aw_id,
        created_at,
        updated_at
      FROM rapids
      WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rapid not found' });
    }

    // Get average rating
    const ratingResult = await pool.query(
      `SELECT
        AVG(rating) as average_rating,
        COUNT(*) as rating_count
      FROM rapid_ratings
      WHERE rapid_id = $1`,
      [id]
    );

    // Get latest flow data
    const flowResult = await pool.query(
      `SELECT
        flow_cfs,
        gauge_height_ft,
        temperature_f,
        recorded_at
      FROM flow_data
      WHERE rapid_id = $1
      ORDER BY recorded_at DESC
      LIMIT 1`,
      [id]
    );

    const rapid = {
      ...result.rows[0],
      average_rating: parseFloat(ratingResult.rows[0].average_rating) || null,
      rating_count: parseInt(ratingResult.rows[0].rating_count),
      current_flow: flowResult.rows[0] || null,
    };

    res.json(rapid);
  } catch (error) {
    console.error('Error fetching rapid:', error);
    res.status(500).json({ error: 'Failed to fetch rapid' });
  }
});

// Search rapids by name or river
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;

    const result = await pool.query(
      `SELECT
        id,
        name,
        river,
        ST_Y(location::geometry) as latitude,
        ST_X(location::geometry) as longitude,
        difficulty
      FROM rapids
      WHERE
        LOWER(name) LIKE LOWER($1) OR
        LOWER(river) LIKE LOWER($1)
      ORDER BY name
      LIMIT 50`,
      [`%${query}%`]
    );

    res.json({
      count: result.rows.length,
      results: result.rows,
    });
  } catch (error) {
    console.error('Error searching rapids:', error);
    res.status(500).json({ error: 'Failed to search rapids' });
  }
});

module.exports = router;
