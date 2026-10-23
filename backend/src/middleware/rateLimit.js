/**
 * Very small in-memory rate limit (per IP) for login and password-reset requests,
 * so nobody can try passwords or send reset emails endlessly.
 */
export function rateLimit({ max, minutes, message }) {
  const hits = new Map();
  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip;
    const recent = (hits.get(key) || []).filter((t) => now - t < minutes * 60 * 1000);
    if (recent.length >= max) {
      return res.status(429).json({ message: message || `Too many attempts. Please try again in ${minutes} minutes.` });
    }
    recent.push(now);
    hits.set(key, recent);
    next();
  };
}
