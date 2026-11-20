import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

// POST /api/progress
router.post('/', async (req, res) => {
  try {
    const { movieId, positionSeconds, durationSeconds, userId } = req.body;
    if (!movieId) {
      return res.status(400).json({ error: 'movieId is required' });
    }

    const effectiveUserId = userId || 'usr_guest';
    const pos = Math.round(positionSeconds || 0);
    const dur = Math.round(durationSeconds || 0);
    const percent = dur > 0 ? Math.round((pos / dur) * 100) : 0;

    const upsertSql = `
      INSERT INTO watch_progress (user_id, movie_id, position, duration, percent, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      ON CONFLICT (user_id, movie_id)
      DO UPDATE SET position = $3, duration = $4, percent = $5, updated_at = NOW()
      RETURNING *
    `;

    const result = await query(upsertSql, [effectiveUserId, movieId, pos, dur, percent]);

    // Update movie progress cache
    await query(
      'UPDATE movies SET progress = $1, last_position = $2 WHERE id = $3',
      [percent, pos, movieId]
    );

    res.json({ success: true, progress: result.rows[0] });
  } catch (error) {
    console.error('Error saving progress:', error);
    res.status(500).json({ error: 'Failed to save watch progress' });
  }
});

// GET /api/progress?userId=...
router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId || 'usr_guest';
    const result = await query(
      'SELECT * FROM watch_progress WHERE user_id = $1',
      [userId]
    );

    const progressMap = {};
    for (const row of result.rows) {
      progressMap[row.movie_id] = {
        position: row.position,
        duration: row.duration,
        percent: row.percent,
        updatedAt: row.updated_at
      };
    }

    res.json(progressMap);
  } catch (error) {
    console.error('Error fetching progress map:', error);
    res.status(500).json({ error: 'Failed to fetch watch progress' });
  }
});

export default router;
