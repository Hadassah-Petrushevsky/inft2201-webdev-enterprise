// Centralized error handler.
// This should be the LAST app.use(...) in server.js.

module.exports = function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  // Mapping error messages to categories
  let errorType = "InternalServerError";

  if (statusCode === 400) errorType = "BadRequest";
  if (statusCode === 401) errorType = "Unauthorized";
  if (statusCode === 403) errorType = "Forbidden";
  if (statusCode === 404) errorType = "NotFound";
  if (statusCode === 429) errorType = "TooManyRequests";

  const response = {
    error: errorType,
    message: 
      statusCode === 500
        ?"An unexpected error occured."
        : err.message,
    statusCode,
    requestId: req.requestId || null,
    timestamp: new Date().toISOString()
  };

  // Adding a retry header if rate limited
  if (statusCode === 429 && err.retryAfter){
    res.setHeader("Retry-After", err.retryAfter);
  }

  console.error("Unhandled error for request", req.requestId, err);

  res.status(statusCode).json(response);
};