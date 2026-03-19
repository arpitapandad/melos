# Login & Authentication — Full Implementation Reference

> *Melos — Google OAuth + Email/Password + Username Flow + Database*

---

## Overview

This document covers the complete authentication system for Melos, including:

- Google OAuth 2.0 login (real API integration)
- Email and password registration and sign-in
- A username prompt step after both Google and email auth
- A PostgreSQL database to store users (email, username, Google ID, timestamps)
- A Node.js/Express backend with JWT session management
- The complete frontend login page with the Melos glassy UI

---

## Architecture

```
Browser (login.html)
      │
      ├── Google OAuth button ──► /auth/google ──► Google OAuth 2.0
      │                                                    │
      │                                            /auth/google/callback
      │                                                    │
      └── Email/Password form ──► POST /auth/register     │
                                  POST /auth/login         │
                                          │                │
                                    If new user ◄──────────┘
                                          │
                                  POST /auth/username
                                          │
                                    JWT issued
                                          │
                                  Redirect → /rooms
```

---

## Google API Setup

### Step 1 — Create a Google Cloud Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click **New Project** → name it `melos`
3. Go to **APIs & Services → OAuth consent screen**
4. Set User Type: **External**
5. Fill in App name: `Melos`, User support email, Developer contact
6. Add scope: `email`, `profile`, `openid`
7. Add your domain to Authorised domains

### Step 2 — Create OAuth Credentials

1. Go to **APIs & Services → Credentials → Create Credentials → OAuth Client ID**
2. Application type: **Web application**
3. Name: `Melos Web`
4. Authorised JavaScript origins:
   - `http://localhost:3000` (development)
   - `https://melos.app` (production)
5. Authorised redirect URIs:
   - `http://localhost:3000/auth/google/callback`
   - `https://melos.app/auth/google/callback`
6. Click **Create** — copy your **Client ID** and **Client Secret**

### Step 3 — Environment Variables

Create a `.env` file in your project root:

```env
PORT=3000
NODE_ENV=development

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Database
DATABASE_URL=postgresql://melos_user:yourpassword@localhost:5432/melos_db

# JWT
JWT_SECRET=your_very_long_random_secret_here_at_least_64_chars
JWT_EXPIRES_IN=7d

# Session
SESSION_SECRET=another_very_long_random_secret_here
```

---

## Database Setup

### PostgreSQL Schema

```sql
-- Create database
CREATE DATABASE melos_db;

-- Connect to it
\c melos_db;

-- Users table
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) UNIQUE NOT NULL,
  username      VARCHAR(50) UNIQUE,
  password_hash VARCHAR(255),
  google_id     VARCHAR(255) UNIQUE,
  avatar_url    VARCHAR(500),
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login    TIMESTAMP WITH TIME ZONE
);

-- Index for fast lookups
CREATE INDEX idx_users_email     ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_username  ON users(username);

-- Rooms table (for future use)
CREATE TABLE rooms (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  theme       VARCHAR(50) DEFAULT 'melos',
  theme_color VARCHAR(20),
  owner_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Room members (for future use)
CREATE TABLE room_members (
  room_id  INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
  user_id  INTEGER REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (room_id, user_id)
);
```

### Running Migrations

```bash
psql -U postgres -f schema.sql
```

---

## Backend — Node.js / Express

### Project Structure

```
melos-backend/
├── .env
├── package.json
├── server.js
├── db.js
├── middleware/
│   └── auth.js
└── routes/
    ├── authRoutes.js
    └── userRoutes.js
```

### package.json

```json
{
  "name": "melos-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cookie-parser": "^1.4.6",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.18.3",
    "express-session": "^1.18.0",
    "jsonwebtoken": "^9.0.2",
    "passport": "^0.7.0",
    "passport-google-oauth20": "^2.0.0",
    "pg": "^8.11.3"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  }
}
```

### db.js

```javascript
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL');
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
```

### middleware/auth.js

```javascript
const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const token = req.cookies?.melos_token
    || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { requireAuth };
```

### routes/authRoutes.js

```javascript
const express       = require('express');
const passport      = require('passport');
const bcrypt        = require('bcryptjs');
const jwt           = require('jsonwebtoken');
const db            = require('../db');
const router        = express.Router();

// ── Helpers ──────────────────────────────────────────────────────────────────

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
      res.cookie('melos_temp_token', tempToken, { httpOnly: true, maxAge: 10 * 60 * 1000 });
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
      'SELECT id FROM users WHERE email = $1', [email.toLowerCase()]
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
    // New user — needs username
    const tempToken = issueToken(user);
    res.cookie('melos_temp_token', tempToken, { httpOnly: true, maxAge: 10 * 60 * 1000 });
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
      'SELECT * FROM users WHERE email = $1', [email.toLowerCase()]
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

    // Update last login
    await db.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    // If no username yet, prompt for one
    if (!user.username) {
      const tempToken = issueToken(user);
      res.cookie('melos_temp_token', tempToken, { httpOnly: true, maxAge: 10 * 60 * 1000 });
      return res.json({ step: 'username' });
    }

    const token = issueToken(user);
    setCookie(res, token);
    res.json({ success: true, redirect: '/rooms' });

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
      'SELECT id FROM users WHERE username = $1', [username.toLowerCase()]
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
    res.json({ success: true, redirect: '/rooms' });

  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
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
```

### server.js

```javascript
require('dotenv').config();

const express        = require('express');
const session        = require('express-session');
const cookieParser   = require('cookie-parser');
const cors           = require('cors');
const passport       = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db             = require('./db');
const authRoutes     = require('./routes/authRoutes');

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://melos.app'
    : 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' },
}));
app.use(passport.initialize());
app.use(express.static('public')); // serve frontend files from /public

// ── Passport Google Strategy ──────────────────────────────────────────────────
passport.use(new GoogleStrategy(
  {
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:  process.env.GOOGLE_CALLBACK_URL,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email     = profile.emails[0].value;
      const googleId  = profile.id;
      const avatarUrl = profile.photos[0]?.value;

      // Check if user exists by Google ID
      let result = await db.query(
        'SELECT * FROM users WHERE google_id = $1', [googleId]
      );

      if (result.rows.length > 0) {
        // Existing Google user — update last login
        await db.query(
          'UPDATE users SET last_login = NOW(), avatar_url = $1 WHERE id = $2',
          [avatarUrl, result.rows[0].id]
        );
        return done(null, result.rows[0]);
      }

      // Check if email already registered via password
      result = await db.query(
        'SELECT * FROM users WHERE email = $1', [email.toLowerCase()]
      );

      if (result.rows.length > 0) {
        // Link Google ID to existing account
        await db.query(
          'UPDATE users SET google_id = $1, avatar_url = $2, updated_at = NOW() WHERE id = $3',
          [googleId, avatarUrl, result.rows[0].id]
        );
        return done(null, result.rows[0]);
      }

      // New user — create account
      result = await db.query(
        `INSERT INTO users (email, google_id, avatar_url, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())
         RETURNING *`,
        [email.toLowerCase(), googleId, avatarUrl]
      );
      return done(null, result.rows[0]);

    } catch (err) {
      return done(err, null);
    }
  }
));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/auth', authRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'melos-api' }));

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Melos API running on port ${PORT}`);
});
```

---

## Frontend — login.html

Save this to your `/public` folder. The Google button links to your real `/auth/google` route. The email/password form posts to `/auth/register` or `/auth/login`. After either flow, if a username is needed the page transitions to the username step in-place without a full reload.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Melos — Sign In</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; }

body {
  width:100vw; height:100vh;
  background:#433850;
  overflow:hidden; cursor:none;
  font-family:Georgia,serif;
}

canvas { position:fixed; inset:0; width:100%; height:100%; pointer-events:none; }

#cursor-dot {
  position:fixed; width:8px; height:8px;
  background:#CBAACB; border-radius:50%;
  pointer-events:none; transform:translate(-50%,-50%);
  z-index:10; opacity:0; transition:opacity 0.3s;
}

#glass-card {
  position:fixed; inset:0;
  display:flex; align-items:center; justify-content:center;
  z-index:5;
}

.card {
  width:360px; max-width:94vw;
  background:rgba(67,56,80,0.48);
  border:1px solid rgba(203,170,203,0.22);
  border-radius:24px;
  backdrop-filter:blur(28px);
  -webkit-backdrop-filter:blur(28px);
  padding:40px 36px 36px;
  display:flex; flex-direction:column; align-items:center;
}

.card-logo-m    { font-size:52px; font-weight:400; color:#CBAACB; line-height:1; }
.card-divider   { width:1px; height:20px; background:#6B3F3F; margin:8px 0 6px; }
.card-word      { font-size:13px; color:#FDFEF5; letter-spacing:6px; }
.card-tagline   { font-size:10px; color:#CBAACB; letter-spacing:3px; opacity:0.65; margin-top:4px; }
.card-sep       { width:100%; height:1px; background:rgba(203,170,203,0.15); margin:28px 0 24px; }

/* ── Step panels ─────────────────────────────────────────── */
.step { width:100%; display:none; flex-direction:column; align-items:center; }
.step.active { display:flex; }

/* ── Google button ────────────────────────────────────────── */
.google-btn {
  width:100%; padding:11px 0; border-radius:999px;
  background:rgba(253,254,245,0.08);
  border:1px solid rgba(253,254,245,0.2);
  color:#FDFEF5; font-family:Georgia,serif;
  font-size:12px; letter-spacing:2px; cursor:pointer;
  display:flex; align-items:center; justify-content:center; gap:10px;
  text-decoration:none;
  transition:background 0.2s, border-color 0.2s;
}
.google-btn:hover { background:rgba(253,254,245,0.15); border-color:rgba(253,254,245,0.38); }

.google-icon { width:16px; height:16px; flex-shrink:0; }

.or-row {
  display:flex; align-items:center; gap:12px;
  width:100%; margin:18px 0 16px;
}
.or-line { flex:1; height:1px; background:rgba(203,170,203,0.15); }
.or-text { font-size:10px; color:rgba(203,170,203,0.45); letter-spacing:2px; }

/* ── Fields ───────────────────────────────────────────────── */
.field { width:100%; margin-bottom:12px; }
.field label {
  display:block; font-size:10px;
  color:rgba(203,170,203,0.58); letter-spacing:2.5px; margin-bottom:6px;
}
.field input {
  width:100%; padding:10px 14px; border-radius:12px;
  background:rgba(253,254,245,0.06);
  border:1px solid rgba(203,170,203,0.18);
  color:#FDFEF5; font-family:Georgia,serif; font-size:13px; outline:none;
  transition:border-color 0.2s, background 0.2s;
}
.field input::placeholder { color:rgba(203,170,203,0.28); }
.field input:focus {
  border-color:rgba(203,170,203,0.55);
  background:rgba(253,254,245,0.09);
}

.submit-btn {
  width:100%; padding:12px 0; border-radius:999px; margin-top:4px;
  background:rgba(203,170,203,0.16);
  border:1px solid rgba(203,170,203,0.38);
  color:#FDFEF5; font-family:Georgia,serif;
  font-size:12px; letter-spacing:3px; cursor:pointer;
  transition:background 0.2s, border-color 0.2s;
}
.submit-btn:hover { background:rgba(203,170,203,0.28); border-color:rgba(203,170,203,0.62); }

.toggle-row {
  margin-top:16px; font-size:10px;
  color:rgba(203,170,203,0.42); letter-spacing:1px; text-align:center;
}
.toggle-link { color:#CBAACB; cursor:pointer; text-decoration:underline; text-underline-offset:2px; }

/* ── Error / info messages ────────────────────────────────── */
.msg {
  width:100%; padding:9px 14px; border-radius:10px;
  font-size:12px; letter-spacing:0.5px; margin-bottom:12px;
  display:none; text-align:center;
}
.msg.error { background:rgba(200,80,80,0.18); border:1px solid rgba(200,80,80,0.3); color:#F4A0A0; }
.msg.info  { background:rgba(203,170,203,0.12); border:1px solid rgba(203,170,203,0.25); color:#CBAACB; }
.msg.show  { display:block; }

/* ── Username step heading ────────────────────────────────── */
.step-title {
  font-size:15px; color:#FDFEF5; letter-spacing:1px;
  margin-bottom:6px; text-align:center;
}
.step-sub {
  font-size:11px; color:rgba(203,170,203,0.5);
  letter-spacing:1px; margin-bottom:22px;
  text-align:center; line-height:1.6;
}

/* ── Loading spinner ──────────────────────────────────────── */
.spinner {
  width:18px; height:18px; border-radius:50%;
  border:2px solid rgba(203,170,203,0.2);
  border-top-color:#CBAACB;
  animation:spin 0.7s linear infinite;
  display:none; margin:0 auto;
}
@keyframes spin { to { transform:rotate(360deg); } }
</style>
</head>
<body>

<canvas id="canvas"></canvas>
<div id="cursor-dot"></div>

<div id="glass-card">
  <div class="card">

    <div class="card-logo-m">M</div>
    <div class="card-divider"></div>
    <div class="card-word">MELOS</div>
    <div class="card-tagline">music together</div>
    <div class="card-sep"></div>

    <!-- ── Step 1: Sign in / Register ───────────────────────── -->
    <div class="step active" id="step-auth">
      <div class="msg" id="auth-msg"></div>

      <a href="/auth/google" class="google-btn">
        <svg class="google-icon" viewBox="0 0 18 18" fill="none">
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 14.013 17.64 11.706 17.64 9.2z" fill="#CBAACB"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#9F87AF"/>
          <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#7A6890"/>
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" fill="#6B3F3F"/>
        </svg>
        continue with google
      </a>

      <div class="or-row">
        <div class="or-line"></div>
        <span class="or-text">or</span>
        <div class="or-line"></div>
      </div>

      <div class="field">
        <label>email</label>
        <input type="email" id="email" placeholder="you@example.com" autocomplete="email"/>
      </div>
      <div class="field">
        <label>password</label>
        <input type="password" id="password" placeholder="••••••••" autocomplete="current-password"/>
      </div>

      <button class="submit-btn" id="auth-btn">sign in</button>
      <div class="spinner" id="auth-spinner"></div>

      <div class="toggle-row">
        no account?
        <span class="toggle-link" id="toggle-link">create one</span>
      </div>
    </div>

    <!-- ── Step 2: Username ──────────────────────────────────── -->
    <div class="step" id="step-username">
      <p class="step-title">one last thing</p>
      <p class="step-sub">choose a username — this is how<br/>others will see you in rooms</p>

      <div class="msg" id="username-msg"></div>

      <div class="field">
        <label>username</label>
        <input type="text" id="username" placeholder="e.g. nightowl_" maxlength="30"
               autocomplete="off" spellcheck="false"/>
      </div>

      <button class="submit-btn" id="username-btn">let's go</button>
      <div class="spinner" id="username-spinner"></div>
    </div>

  </div>
</div>

<script>
// ── Background animation (same line system as login.html) ────────────────────
const canvas = document.getElementById('canvas');
const ctx    = canvas.getContext('2d');
const dot    = document.getElementById('cursor-dot');
const C = { bg:'#433850', cream:'#FDFEF5', lavender:'#CBAACB', plum:'#6B3F3F', slate:'#454859' };
const LINE_COLORS = [C.lavender,C.plum,C.slate,'#5C4A6A','#7A5C5C','#3D3F52','#8B7A9B','#4A5068'];
let W, H, lines = [], mouse = {x:-999,y:-999}, animId;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
  buildLines(); drawBg();
}
function buildLines() {
  lines = []; let x = 0;
  for (let i = 0; i < Math.floor(W/18)+2; i++) {
    const w = 10 + Math.random() * 22;
    lines.push({ x, w, pts: makePath(x,w), color: LINE_COLORS[i%LINE_COLORS.length], hoverAmt:0 });
    x += w + 1 + Math.random() * 6;
  }
}
function makePath(x,w) {
  const pts=[], segs=8+Math.floor(Math.random()*6);
  for(let i=0;i<=segs;i++) pts.push({x:x+(Math.random()-.5)*w*0.6, y:(i/segs)*H});
  return pts;
}
function lineHit(l) {
  for(let i=0;i<l.pts.length-1;i++){
    const p0=l.pts[i],p1=l.pts[i+1];
    if(mouse.y<p0.y||mouse.y>p1.y) continue;
    const t=(mouse.y-p0.y)/(p1.y-p0.y);
    if(Math.abs(mouse.x-(p0.x+t*(p1.x-p0.x)))<l.w*0.7+8) return true;
  }
  return false;
}
function lerp(a,b,t){
  const ah=a.replace('#',''),bh=b.replace('#','');
  const ar=parseInt(ah.slice(0,2),16),ag=parseInt(ah.slice(2,4),16),ab=parseInt(ah.slice(4,6),16);
  const br=parseInt(bh.slice(0,2),16),bg=parseInt(bh.slice(2,4),16),bb=parseInt(bh.slice(4,6),16);
  return `rgb(${Math.round(ar+(br-ar)*t)},${Math.round(ag+(bg-ag)*t)},${Math.round(ab+(bb-ab)*t)})`;
}
function drawBg() {
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle=C.bg; ctx.fillRect(0,0,W,H);
  lines.forEach(l=>{
    const pts=l.pts;
    ctx.beginPath(); ctx.moveTo(pts[0].x+l.w/2,pts[0].y);
    for(let i=1;i<pts.length;i++){
      const p=pts[i-1],c=pts[i];
      ctx.quadraticCurveTo(p.x+l.w/2,p.y,(p.x+c.x)/2+l.w/2,(p.y+c.y)/2);
    }
    ctx.lineTo(pts[pts.length-1].x+l.w/2,pts[pts.length-1].y);
    ctx.lineWidth=l.w*(1+l.hoverAmt*0.15);
    ctx.strokeStyle=lerp(l.color,C.cream,l.hoverAmt);
    ctx.globalAlpha=0.55+l.hoverAmt*0.45; ctx.lineCap='round'; ctx.stroke(); ctx.globalAlpha=1;
  });
}
function tick(){
  let dirty=false;
  lines.forEach(l=>{
    const tgt=lineHit(l)?1:0, prev=l.hoverAmt;
    l.hoverAmt+=(tgt-l.hoverAmt)*0.12;
    if(Math.abs(l.hoverAmt-prev)>0.002) dirty=true;
  });
  if(dirty) drawBg();
  animId=requestAnimationFrame(tick);
}
document.addEventListener('mousemove',e=>{
  mouse.x=e.clientX; mouse.y=e.clientY;
  dot.style.left=e.clientX+'px'; dot.style.top=e.clientY+'px'; dot.style.opacity='1';
});
document.addEventListener('mouseleave',()=>{ mouse.x=-999; mouse.y=-999; dot.style.opacity='0'; });
window.addEventListener('resize',()=>{ cancelAnimationFrame(animId); resize(); });
resize(); tick();

// ── Check URL for step=username (post Google OAuth) ──────────────────────────
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('step') === 'username') showStep('username');
if (urlParams.get('error') === 'google_failed') showMsg('auth-msg', 'Google sign-in failed. Please try again.', 'error');

// ── Auth UI logic ─────────────────────────────────────────────────────────────
let isRegistering = false;
const toggleLink  = document.getElementById('toggle-link');
const authBtn     = document.getElementById('auth-btn');

toggleLink.addEventListener('click', () => {
  isRegistering = !isRegistering;
  authBtn.textContent    = isRegistering ? 'create account' : 'sign in';
  toggleLink.textContent = isRegistering ? 'sign in instead' : 'create one';
  hideMsg('auth-msg');
});

authBtn.addEventListener('click', async () => {
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  if (!email || !password) { showMsg('auth-msg', 'Please enter your email and password.', 'error'); return; }

  setLoading('auth', true);
  try {
    const endpoint = isRegistering ? '/auth/register' : '/auth/login';
    const res  = await fetch(endpoint, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (!res.ok) { showMsg('auth-msg', data.error || 'Something went wrong.', 'error'); return; }
    if (data.step === 'username') { showStep('username'); return; }
    if (data.redirect) window.location.href = data.redirect;

  } catch (err) {
    showMsg('auth-msg', 'Network error. Please try again.', 'error');
  } finally {
    setLoading('auth', false);
  }
});

// Allow Enter key to submit
document.getElementById('password').addEventListener('keydown', e => {
  if (e.key === 'Enter') authBtn.click();
});

// ── Username step ─────────────────────────────────────────────────────────────
document.getElementById('username-btn').addEventListener('click', async () => {
  const username = document.getElementById('username').value.trim();
  if (!username) { showMsg('username-msg', 'Please enter a username.', 'error'); return; }

  setLoading('username', true);
  try {
    const res  = await fetch('/auth/username', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });
    const data = await res.json();

    if (!res.ok) { showMsg('username-msg', data.error || 'Something went wrong.', 'error'); return; }
    if (data.redirect) window.location.href = data.redirect;

  } catch (err) {
    showMsg('username-msg', 'Network error. Please try again.', 'error');
  } finally {
    setLoading('username', false);
  }
});

document.getElementById('username').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('username-btn').click();
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function showStep(name) {
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
  document.getElementById('step-' + name).classList.add('active');
}
function showMsg(id, text, type) {
  const el = document.getElementById(id);
  el.textContent = text;
  el.className = 'msg ' + type + ' show';
}
function hideMsg(id) {
  document.getElementById(id).className = 'msg';
}
function setLoading(step, loading) {
  document.getElementById(step + '-btn').style.display     = loading ? 'none' : '';
  document.getElementById(step + '-spinner').style.display = loading ? 'block' : 'none';
}
</script>
</body>
</html>
```

---

## Installation & Running

```bash
# Clone / navigate to your project
cd melos-backend

# Install dependencies
npm install

# Set up your .env file (see Environment Variables section above)

# Set up the database
psql -U postgres -f schema.sql

# Run in development
npm run dev

# Open in browser
open http://localhost:3000/login.html
```

---

## Auth Flow Summary

| Step | Trigger | What happens |
|---|---|---|
| Google click | User clicks "continue with google" | Redirect to Google OAuth consent screen |
| Google callback | Google redirects back | User created/found in DB; if no username → temp token cookie set, redirect to `?step=username` |
| Email register | POST `/auth/register` | Password hashed (bcrypt, 12 rounds), user saved, temp token set, `{ step: 'username' }` returned |
| Email sign in | POST `/auth/login` | Password verified, if no username → temp token, otherwise JWT issued and cookie set |
| Username submit | POST `/auth/username` | Temp token verified, username uniqueness checked, saved to DB, full JWT issued, redirect `/rooms` |
| Subsequent visits | Cookie `melos_token` present | JWT verified server-side on any protected route via `requireAuth` middleware |
| Sign out | POST `/auth/logout` | Both cookies cleared |

---

## Security Notes

- Passwords are hashed with **bcrypt at cost factor 12** — never stored in plain text
- JWTs are stored in **httpOnly cookies** — inaccessible to JavaScript, resistant to XSS
- Temp tokens expire in **10 minutes** — short-lived to reduce exposure during username step
- Username validation: **3–30 chars, alphanumeric + underscore only**, enforced both client and server side
- CORS is restricted to your domain only in production
- All database queries use **parameterised statements** — no SQL injection risk

---

*Melos — login-auth reference — March 2026*