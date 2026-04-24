const express = require("express");
const jwt = require("jsonwebtoken");
const users = require("../data/users");

const router = express.Router();
const SECRET = process.env.JWT_SECRET || "CHANGE_ME_BEFORE_SUBMISSION";

// POST /login
// Body: { username, password }
// On success: return a JWT that includes { userId, role } as claims.
router.post("/login", (req, res, next) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password){
    const err = new Error("Username and password required");
    err.statusCode = 400;
    return next(err);
  }

  // Find User
  const user = users.find(
    u => u.username === username && u.password === password
  );

  // Invalid Credentials
  if (!user) {
    const err = new Error("Invalid credentials");
    err.statusCode = 401;
    return next(err);
  }

  // Create JWT payload
  const payload = {
    userId: user.id,
    role: user.role
  };

  // Sign token
  const token = jwt.sign(payload, SECRET, {
    expiresIn: "1h"
  });

  // Return Token
  res.json({ token });
});

module.exports = router;