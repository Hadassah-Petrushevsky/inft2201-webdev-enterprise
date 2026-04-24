const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "MY_SECRET";


module.exports = function authenticateJWT(req, res, next) {
    const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const err = new Error("Missing or invalid token");
    err.statusCode = 401;
    return next(err);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET);

    // Attach user to request (VERY IMPORTANT)
    req.user = decoded;

    next();
  } catch (err) {
    const error = new Error("Invalid or expired token");
    error.statusCode = 401;
    return next(error);
  }
};