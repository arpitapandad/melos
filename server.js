require('dotenv').config();

const express        = require('express');
const session        = require('express-session');
const cookieParser   = require('cookie-parser');
const cors           = require('cors');
const passport       = require('passport');
const path           = require('path');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db             = require('./db');
const authRoutes     = require('./routes/authRoutes');

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://melos.app'
    : `http://localhost:${process.env.PORT || 3000}`,
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

// Serve all static frontend files from /public
app.use(express.static(path.join(__dirname, 'public')));

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
        // Existing Google user — update last login & avatar
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
        // Link Google ID to existing email account
        await db.query(
          'UPDATE users SET google_id = $1, avatar_url = $2, updated_at = NOW() WHERE id = $3',
          [googleId, avatarUrl, result.rows[0].id]
        );
        return done(null, result.rows[0]);
      }

      // Brand new user — create account
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
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'melos-api', env: process.env.NODE_ENV });
});

// Catch-all — serve index.html for any unmatched GET (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Start ─────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n  Melos API running on http://localhost:${PORT}`);
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}\n`);
});
