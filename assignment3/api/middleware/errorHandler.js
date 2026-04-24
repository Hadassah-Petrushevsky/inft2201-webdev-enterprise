// Centralized error handler.
// This should be the LAST app.use(...) in server.js.

module.exports = function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  const response = {
    error: err.message || "InternalServerError",
    message: statusCode === 500
      ?"An unexpected error occured."
      : err.message,
    statusCode,
    requestId: req.requestId || null,
    timestamp: new Date().toISOString()
  };

  console.error("Unhandled error for request", req.requestId, err);

  res.status(statusCode).json(response);
};