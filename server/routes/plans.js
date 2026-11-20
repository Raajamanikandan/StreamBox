import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

// GET /api/plans
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM plans ORDER BY price ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ error: 'Failed to fetch subscription plans' });
  }
});

// POST /api/subscriptions
router.post('/', async (req, res) => {
  try {
    const { planId, userId } = req.body;
    const effectiveUserId = userId || 'usr_guest';

    const planRes = await query('SELECT * FROM plans WHERE id = $1', [planId]);
    if (planRes.rows.length === 0) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    const plan = planRes.rows[0];

    const startedAt = new Date();
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    const subRes = await query(
      `INSERT INTO subscriptions (user_id, plan_id, plan_name, status, started_at, expires_at)
       VALUES ($1, $2, $3, 'active', $4, $5)
       RETURNING *`,
      [effectiveUserId, plan.id, plan.name, startedAt, expiresAt]
    );

    const sub = subRes.rows[0];

    res.json({
      success: true,
      subscription: {
        planId: sub.plan_id,
        planName: sub.plan_name,
        status: sub.status,
        startedAt: sub.started_at,
        expiresAt: sub.expires_at
      }
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// GET /api/subscriptions/current?userId=...
router.get('/current', async (req, res) => {
  try {
    const userId = req.query.userId || 'usr_guest';
    const result = await query(
      `SELECT * FROM subscriptions 
       WHERE user_id = $1 AND status = 'active' AND expires_at > NOW()
       ORDER BY started_at DESC LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.json(null);
    }

    const sub = result.rows[0];
    res.json({
      planId: sub.plan_id,
      planName: sub.plan_name,
      status: sub.status,
      startedAt: sub.started_at,
      expiresAt: sub.expires_at
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: 'Failed to fetch current subscription' });
  }
});

export default router;
