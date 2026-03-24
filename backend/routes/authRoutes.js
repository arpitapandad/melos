const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const store    = require('../store');
const router   = express.Router();

// ── Helper: issue a 10-min temp token, send user to username step ─────────────
function issueTempAndRedirectToUsername(res, user, name) {
  // If user already has a username in the permanent store, skip the temp-token/username step
  if (user && user.username) {
    const sessionToken = jwt.sign(
      {
        id:         user.id,
        email:      user.email,
        name:       user.name,
        username:   user.username,
        avatar_url: user.avatar_url,
        spotify_token: user.spotify_token || null
      },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );

    res.cookie('melos_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return res.json({ redirect: '/create-room.html' });
  }

  const tempToken = jwt.sign(
    {
      id:    user.id,
      email: user.email,
      name:  name || user.name || null,
      spotify_token: user.spotify_token || null,
    },
    process.env.JWT_SECRET,
    { expiresIn: '10m' }
  );

  res.cookie('melos_temp_token', tempToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 10 * 60 * 1000,
  });

  // Tell the frontend to transition to the username step
  return res.json({ step: 'username' });
}

// ── Email Registration ────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  try {
    if (store.findBy('email', email.toLowerCase())) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const hash = await bcrypt.hash(password, 12);
    const user = store.create({
      name:          name || null,
      email:         email.toLowerCase(),
      password_hash: hash,
    });

    return issueTempAndRedirectToUsername(res, user, name);

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
    const user = store.findBy('email', email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'No account found with this email' });
    }
    if (!user.password_hash) {
      return res.status(401).json({ error: 'This account uses Google sign-in' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    store.update(user.id, { last_login: new Date().toISOString() });

    // Go to username step — same as Google flow
    return issueTempAndRedirectToUsername(res, user, user.name);

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

module.exports = router;
