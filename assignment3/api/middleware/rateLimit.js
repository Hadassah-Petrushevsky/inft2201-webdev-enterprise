const windowMs = (parseInt(process.env.RATE_LIMIT_WINDOW_SECONDS, 10) || 60) * 1000;
const maxRequests = parseInt(process.env.RATE_LIMIT_MAX, 10) || 5;

const buckets = new Map();
// shape: key -> { count, windowStart }

module.exports = function rateLimit(req, res, next) {
  // Use the userId if logged in, otherwise IP
  const key = req.user?.userId || req.ip;
  const now = Date.now();

  let entry = buckets.get(key);
  
  // No entry yet or window is expired so reset
  if(!entry || now - entry.windowStart > windowMs) {
    entry = {
      count: 1,
      windowStart: now
    };
    buckets.set(key, entry);
    return next();
  }

  // Count increase
  entry.count++;

  if (entry.count > maxRequests) {
    const retryAfter = Math.ceil(
      (entry.windowStart + windowMs - now) / 1000
    );

    const err = new Error("Too many requests");
    err.statusCode = 429;
    err.retryAfter = retryAfter;

    return next(err);
  }
  next();
};