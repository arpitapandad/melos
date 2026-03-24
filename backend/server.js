require('dotenv').config();

const express        = require('express');
const session        = require('express-session');
const cookieParser   = require('cookie-parser');
const cors           = require('cors');
const passport       = require('passport');
const path           = require('path');
const jwt            = require('jsonwebtoken');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const SpotifyStrategy= require('passport-spotify').Strategy;
const axios           = require('axios');
const store          = require('./store');
const authRoutes     = require('./routes/authRoutes');

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    `http://localhost:${process.env.PORT || 3000}`,
    `http://127.0.0.1:${process.env.PORT || 3000}`
  ],
  credentials: true,
}));

// MUST enforce 127.0.0.1 to avoid split-brain cookies between localhost and 127.0.0.1
app.use((req, res, next) => {
  if (req.hostname === 'localhost') {
    return res.redirect(301, `http://127.0.0.1:${process.env.PORT || 3000}${req.originalUrl}`);
  }
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false },
}));
app.use(passport.initialize());

// Serve frontend from /public
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
      const name      = profile.displayName;

      let user = store.findBy('google_id', googleId);
      if (user) {
        store.update(user.id, { last_login: new Date().toISOString(), avatar_url: avatarUrl });
        return done(null, { ...user, name });
      }

      user = store.findBy('email', email.toLowerCase());
      if (user) {
        store.update(user.id, { google_id: googleId, avatar_url: avatarUrl });
        return done(null, { ...user, name });
      }

      // New user — save to store
      user = store.create({ email: email.toLowerCase(), google_id: googleId, avatar_url: avatarUrl, name });
      return done(null, user);

    } catch (err) {
      return done(err, null);
    }
  }
));

// ── Google OAuth Routes ───────────────────────────────────────────────────────
app.get('/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account',
    session: false,
  })
);

app.get('/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login.html?error=google_failed',
    session: false,
  }),
  (req, res) => {
    // Check if user already has a username in our store
    const user = req.user;
    if (user && user.username) {
      const sessionToken = jwt.sign(
        {
          id:         user.id,
          email:      user.email,
          name:       user.name,
          username:   user.username,
          avatar_url: user.avatar_url,
          spotify_token: user.spotify_token
        },
        process.env.JWT_SECRET,
        { expiresIn: '12h' }
      );

      res.cookie('melos_token', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });

      return res.redirect('/create-room.html');
    }

    // Issue a short-lived (10 min) temp token holding Google profile info
    const tempToken = jwt.sign(
      {
        id:         req.user.id,
        email:      req.user.email,
        name:       req.user.name,
        avatar_url: req.user.avatar_url,
      },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );

    // Temp cookie — expires in 10 minutes
    res.cookie('melos_temp_token', tempToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 10 * 60 * 1000,
    });

    // Send to username-pick step
    res.redirect('/login.html?step=username');
  }
);

// Update username for an active session
app.post('/auth/update-username', (req, res) => {
  const { username } = req.body;
  const token = req.cookies?.melos_token;

  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  if (!username || username.trim().length < 2) return res.status(400).json({ error: 'Username too short' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const updated = store.update(decoded.id, { username: username.trim() });
    
    // Issue NEW token with updated username
    const newToken = jwt.sign(
      {
        id: updated.id,
        email: updated.email,
        username: updated.username,
        avatar_url: updated.avatar_url,
        spotify_token: updated.spotify_token
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('melos_token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ success: true, username: updated.username });
  } catch (err) {
    res.status(401).json({ error: 'Invalid session' });
  }
});

// ── Passport Spotify Strategy ─────────────────────────────────────────────────
passport.use(new SpotifyStrategy(
  {
    clientID:     process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    callbackURL:  process.env.SPOTIFY_CALLBACK_URL,
    passReqToCallback: true,
  },
  async (req, accessToken, refreshToken, expiresIn, profile, done) => {
    const expiresAt = Date.now() + (expiresIn * 1000);
    try {
      const email     = (profile.emails && profile.emails.length > 0) ? profile.emails[0].value : null;
      const spotifyId = profile.id;
      const avatarUrl = (profile.photos && profile.photos.length > 0) ? profile.photos[0].value : null;
      const name      = profile.displayName || profile.username || 'SpotifyUser';

      // 1. ACCOUNT LINKING: Check if user is already logged in
      let currentUserId = null;
      const token = req.cookies?.melos_token || req.cookies?.melos_temp_token;
      console.log(`[SpotifyStrategy] Profile ID: ${spotifyId}, Email: ${email}`);
      
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          currentUserId = decoded.id;
          console.log(`[SpotifyStrategy] Found existing session for ID: ${currentUserId}`);
        } catch (err) {
          console.log(`[SpotifyStrategy] Token verification failed: ${err.message}`);
        }
      }

      // If already logged in, link to the current user
      if (currentUserId) {
        const existingUser = store.findById(currentUserId);
        if (existingUser) {
          // KEY IMPROVEMENT: If the session token has a username, but the DB doesn't, save it!
          const sessionUsername = (token ? jwt.decode(token)?.username : null) || existingUser.username;
          console.log(`[SpotifyStrategy] Linking Spotify. Current session username: ${sessionUsername}`);
          
          const updated = store.update(currentUserId, {
            spotify_token: accessToken,
            spotify_refresh_token: refreshToken,
            spotify_token_expires_at: expiresAt,
            username: sessionUsername, // Carry over the username from the session
            avatar_url: existingUser.avatar_url || avatarUrl
          });
          return done(null, { ...updated, spotify_token: accessToken });
        }
      }

      // 2. NORMAL LOGIN: Try find by spotify_id
      let user = store.findBy('spotify_id', spotifyId);
      if (user) {
        console.log(`[SpotifyStrategy] Found by Spotify ID: ${spotifyId}`);
        const updated = store.update(user.id, {
          last_login: new Date().toISOString(),
          avatar_url: user.avatar_url || avatarUrl,
          spotify_token: accessToken,
          spotify_refresh_token: refreshToken || user.spotify_refresh_token,
          spotify_token_expires_at: expiresAt
        });
        return done(null, { ...updated, spotify_token: accessToken });
      }

      // 3. EMAIL MATCHING: Try find by email
      if (email) {
        user = store.findBy('email', email.toLowerCase());
        if (user) {
          console.log(`[SpotifyStrategy] Found by Email match: ${email}`);
          const updated = store.update(user.id, {
            spotify_id: spotifyId,
            avatar_url: user.avatar_url || avatarUrl,
            spotify_token: accessToken,
            spotify_refresh_token: refreshToken,
            spotify_token_expires_at: expiresAt
          });
          return done(null, { ...updated, spotify_token: accessToken });
        }
      }

      // 4. NEW USER: Create fresh record
      console.log(`[SpotifyStrategy] Creating new user record for Spotify.`);
      user = store.create({
        email: email ? email.toLowerCase() : `spotify-${spotifyId}@melos.app`,
        spotify_id: spotifyId,
        avatar_url: avatarUrl,
        name,
        spotify_token: accessToken,
        spotify_refresh_token: refreshToken,
        spotify_token_expires_at: expiresAt
      });
      return done(null, { ...user, spotify_token: accessToken });
    } catch (err) {
      return done(err);
    }
  }
));

// ── Spotify OAuth Routes ──────────────────────────────────────────────────────
app.get('/auth/spotify', (req, res, next) => {
  const { returnTo } = req.query;
  // Use state to pass the return URL through the OAuth flow
  const state = returnTo ? Buffer.from(returnTo).toString('base64') : '';
  
  passport.authenticate('spotify', {
    scope: ['user-read-email', 'user-read-private', 'streaming', 'user-read-playback-state', 'user-modify-playback-state', 'user-read-recently-played'],
    showDialog: true,
    session: false,
    state: state
  })(req, res, next);
});

app.get('/auth/spotify/callback',
  passport.authenticate('spotify', {
    failureRedirect: '/login.html?error=spotify_failed',
    session: false,
  }),
  (req, res) => {
    const { state } = req.query;
    const returnTo = state ? Buffer.from(state, 'base64').toString() : null;
    
    // Check if user already exists and has a username in our store
    const user = req.user;
    console.log(`[SpotifyAuth] Callback for user: ${user?.email}, ID: ${user?.id}, Username: ${user?.username}`);
    
    // If they already have a username, skip the set-username step
    if (user && user.username) {
      console.log(`[SpotifyAuth] Existing username found (${user.username}), skipping to room.`);
      const sessionToken = jwt.sign(
        {
          id:         user.id,
          email:      user.email,
          name:       user.name,
          username:   user.username,
          avatar_url: user.avatar_url
        },
        process.env.JWT_SECRET,
        { expiresIn: '12h' }
      );

      res.cookie('melos_token', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });

      // Redirect back to the room they were in, or the dashboard
      return res.redirect(returnTo || '/create-room.html');
    }

    const tempToken = jwt.sign(
      {
        id:         user.id,
        email:      user.email,
        name:       user.name,
        avatar_url: user.avatar_url
      },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );

    res.cookie('melos_temp_token', tempToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 10 * 60 * 1000,
    });

    res.redirect('/login.html?step=username');
  }
);

// ── Set Session Username (called from username step in login.html) ─────────────
app.post('/auth/set-username', (req, res) => {
  const { username } = req.body;
  const tempToken    = req.cookies?.melos_temp_token;

  if (!tempToken) {
    return res.status(401).json({ error: 'Session expired — please sign in again.' });
  }
  if (!username || username.trim().length < 2) {
    return res.status(400).json({ error: 'Username must be at least 2 characters.' });
  }
  if (username.trim().length > 30) {
    return res.status(400).json({ error: 'Username must be 30 characters or fewer.' });
  }

  try {
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);

    // PERSIST username to store — this is the key fix
    console.log(`[Auth] Setting username for ID: ${decoded.id} to: ${username.trim()}`);
    store.update(decoded.id, { username: username.trim() });

    // Full session token — contains name + chosen username for this session
    const sessionToken = jwt.sign(
      {
        id:         decoded.id,
        email:      decoded.email,
        name:       decoded.name,
        username:   username.trim(),
        avatar_url: decoded.avatar_url
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Clear temp token
    res.clearCookie('melos_temp_token');

    // ★ SESSION cookie
    res.cookie('melos_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    res.json({ success: true, redirect: '/create-room.html' });

  } catch (err) {
    res.clearCookie('melos_temp_token');
    res.status(401).json({ error: 'Session expired — please sign in again.' });
  }
});

// ── Who am I? (for create-room to greet the user) ────────────────────────────
app.get('/auth/me', (req, res) => {
  const token = req.cookies?.melos_token;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = store.findById(decoded.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      name:         user.name,
      username:     user.username,
      email:        user.email,
      avatar_url:   user.avatar_url,
      has_spotify:  !!user.spotify_refresh_token, // Check refresh token Presence
      spotify_connected: !!user.spotify_token
    });
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired session' });
  }
});

/**
 * Helper to get or refresh Spotify token from store
 */
async function getOrRefreshSpotifyToken(userId) {
  const user = store.findById(userId);
  if (!user || !user.spotify_refresh_token) return null;

  const now = Date.now();
  // Refresh if expires in less than 5 mins
  if (!user.spotify_token || !user.spotify_token_expires_at || (user.spotify_token_expires_at - now < 300000)) {
    console.log(`[Spotify] Refreshing token for user ${userId}...`);
    try {
      const basicAuth = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64');
      const params = new URLSearchParams();
      params.append('grant_type', 'refresh_token');
      params.append('refresh_token', user.spotify_refresh_token);

      const response = await axios.post('https://accounts.spotify.com/api/token', params, {
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const { access_token, expires_in, refresh_token } = response.data;
      const updated = store.update(userId, {
        spotify_token: access_token,
        spotify_refresh_token: refresh_token || user.spotify_refresh_token,
        spotify_token_expires_at: Date.now() + (expires_in * 1000)
      });
      return updated.spotify_token;
    } catch (err) {
      console.error('[Spotify] Refresh failed:', err.response?.data || err.message);
      return null;
    }
  }
  return user.spotify_token;
}

// Get Spotify token for Web SDK
app.get('/auth/spotify/token', async (req, res) => {
  const token = req.cookies?.melos_token;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const accessToken = await getOrRefreshSpotifyToken(decoded.id);
    if (!accessToken) return res.status(400).json({ error: 'Failed to refresh token' });
    res.json({ access_token: accessToken });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// ── Spotify API Proxy ────────────────────────────────────────────────────────
app.get('/api/spotify/recent', async (req, res) => {
  const token = req.cookies?.melos_token;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const accessToken = await getOrRefreshSpotifyToken(decoded.id);
    if (!accessToken) return res.status(401).json({ error: 'Spotify session expired — please re-auth' });

    const response = await axios.get('https://api.spotify.com/v1/me/player/recently-played?limit=10', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    res.json(response.data.items);
  } catch (err) {
    console.error('Recent tracks error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch recent tracks' });
  }
});

app.get('/api/spotify/search', async (req, res) => {
  const { q } = req.query;
  const token = req.cookies?.melos_token;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const accessToken = await getOrRefreshSpotifyToken(decoded.id);
    if (!accessToken) return res.status(401).json({ error: 'Spotify session expired' });

    const response = await axios.get(`https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&limit=10`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    res.json(response.data.tracks.items);
  } catch (err) {
    console.error('Search error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Spotify search failed' });
  }
});

app.post('/api/spotify/play', async (req, res) => {
  const { uri, device_id } = req.body;
  const token = req.cookies?.melos_token;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const accessToken = await getOrRefreshSpotifyToken(decoded.id);
    if (!accessToken) return res.status(400).json({ error: 'No Spotify account linked' });

    // Construct Spotify API URL with device_id if provided
    let playUrl = 'https://api.spotify.com/v1/me/player/play';
    if (device_id) playUrl += `?device_id=${device_id}`;

    await axios.put(playUrl, 
      { uris: [uri] },
      { headers: { 'Authorization': `Bearer ${accessToken}` } }
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Play error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to start playback. Make sure you have an active Spotify device.' });
  }
});

// ── Sign Out ──────────────────────────────────────────────────────────────────
app.post('/auth/logout', (req, res) => {
  res.clearCookie('melos_token');
  res.clearCookie('melos_temp_token');
  res.json({ success: true });
});

// ── Email/Password Routes ─────────────────────────────────────────────────────
app.use('/auth', authRoutes);

// Health
app.get('/health', (_req, res) => res.json({ status: 'ok', users: store.all().length }));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n  Melos API running on http://localhost:${PORT}`);
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}\n`);
});
