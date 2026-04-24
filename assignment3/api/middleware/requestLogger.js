const { v4: uuidv4 } = require("uuid");

module.exports = function requestLogger(req, res, next) {
  const requestId = uuidv4();

  req.requestId = requestId;

  console.log(`REQUEST ${requestId} ${req.method} ${req.path}`);

  next();
};