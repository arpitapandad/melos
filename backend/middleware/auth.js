const jwt = require('jsonwebtoken');

/**
 * Middleware — protect routes requiring a valid JWT session cookie.
 * Attaches decoded user payload to req.user.
 */
function requireAuth(req, res, next) {
  const token =
    req.cookies?.melos_token ||
    req.headers.authorization?.split(' ')[1];

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
