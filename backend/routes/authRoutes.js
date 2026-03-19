const express       = require('express');
const passport      = require('passport');
const bcrypt        = require('bcryptjs');
const jwt           = require('jsonwebtoken');
const db            = require('../db');
const router        = express.Router();

// ── Helpers ───────────────────────────────────────────────────────────────────

function issueToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function setCookie(res, token) {
  res.cookie('melos_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

// ── Google OAuth ──────────────────────────────────────────────────────────────

router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account',
  })
);

router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login?error=google_failed',
    session: false,
  }),
  (req, res) => {
    // If user has no username yet, redirect to username setup
    if (!req.user.username) {
      const tempToken = issueToken(req.user);
      res.cookie('melos_temp_token', tempToken, {
        httpOnly: true,
        maxAge: 10 * 60 * 1000, // 10 min
      });
      return res.redirect('/login?step=username');
    }
    const token = issueToken(req.user);
    setCookie(res, token);
    res.redirect('/rooms');
  }
);

// ── Email Registration ────────────────────────────────────────────────────────

router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  try {
    // Check if email already exists
    const existing = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const hash = await bcrypt.hash(password, 12);
    const result = await db.query(
      `INSERT INTO users (email, password_hash, created_at, updated_at)
       VALUES ($1, $2, NOW(), NOW())
       RETURNING id, email, username`,
      [email.toLowerCase(), hash]
    );

    const user = result.rows[0];
    // New user — needs username step
    const tempToken = issueToken(user);
    res.cookie('melos_temp_token', tempToken, {
      httpOnly: true,
      maxAge: 10 * 60 * 1000,
    });
    return res.json({ step: 'username' });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// ── Email Sign In ─────────────────────────────────────────────────────────────

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'No account found with this email' });
    }

    const user = result.rows[0];
    if (!user.password_hash) {
      return res.status(401).json({ error: 'This account uses Google sign-in' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    // Update last login timestamp
    await db.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    // If no username yet, prompt for one
    if (!user.username) {
      const tempToken = issueToken(user);
      res.cookie('melos_temp_token', tempToken, {
        httpOnly: true,
        maxAge: 10 * 60 * 1000,
      });
      return res.json({ step: 'username' });
    }

    const token = issueToken(user);
    setCookie(res, token);
    res.json({ success: true, redirect: '/create-room.html' });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// ── Set Username ──────────────────────────────────────────────────────────────

router.post('/username', async (req, res) => {
  const { username } = req.body;
  const tempToken = req.cookies?.melos_temp_token;

  if (!tempToken) {
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
  }
  if (!username || username.length < 3 || username.length > 30) {
    return res.status(400).json({ error: 'Username must be between 3 and 30 characters' });
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return res.status(400).json({ error: 'Username can only contain letters, numbers, and underscores' });
  }

  try {
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);

    // Check uniqueness
    const taken = await db.query(
      'SELECT id FROM users WHERE username = $1',
      [username.toLowerCase()]
    );
    if (taken.rows.length > 0) {
      return res.status(409).json({ error: 'This username is already taken' });
    }

    const result = await db.query(
      `UPDATE users SET username = $1, updated_at = NOW()
       WHERE id = $2 RETURNING id, email, username`,
      [username.toLowerCase(), decoded.id]
    );

    const user = result.rows[0];
    res.clearCookie('melos_temp_token');
    const token = issueToken(user);
    setCookie(res, token);
    res.json({ success: true, redirect: '/create-room.html' });

  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    console.error('Username error:', err);
    res.status(500).json({ error: 'Server error setting username' });
  }
});

// ── Sign Out ──────────────────────────────────────────────────────────────────

router.post('/logout', (req, res) => {
  res.clearCookie('melos_token');
  res.clearCookie('melos_temp_token');
  res.json({ success: true });
});

// ── Current User ──────────────────────────────────────────────────────────────

router.get('/me', async (req, res) => {
  const token = req.cookies?.melos_token;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result  = await db.query(
      'SELECT id, email, username, avatar_url, created_at FROM users WHERE id = $1',
      [decoded.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
