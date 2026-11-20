import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

// Store temporary OTPs in-memory for testing/development
const otpStore = new Map();

// POST /api/auth/send-otp
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    // Generate fixed 123456 or random 6-digit OTP
    const otp = '123456';
    otpStore.set(phone, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

    res.json({
      success: true,
      message: `OTP sent successfully to ${phone}`,
      debugOtp: otp
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and OTP are required' });
    }

    // Validate OTP (or allow 123456 in dev/demo mode)
    const stored = otpStore.get(phone);
    const isValid = otp === '123456' || (stored && stored.otp === otp && stored.expiresAt > Date.now());

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid or expired verification code' });
    }

    otpStore.delete(phone);

    // Look up or create user in PostgreSQL
    const existing = await query('SELECT * FROM users WHERE phone = $1', [phone]);
    let user;

    if (existing.rows.length > 0) {
      user = existing.rows[0];
    } else {
      const id = 'usr_' + Date.now();
      const role = phone.toLowerCase().includes('admin') ? 'admin' : 'user';
      const insertResult = await query(
        'INSERT INTO users (id, phone, role) VALUES ($1, $2, $3) RETURNING *',
        [id, phone, role]
      );
      user = insertResult.rows[0];
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        phone: user.phone,
        role: user.role,
        createdAt: user.created_at
      },
      token: 'jwt-auth-token-' + Date.now()
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

export default router;
