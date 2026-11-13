const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const config = require("../config");
const { users } = require("../db");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const genericError = { error: "Invalid email or password" };

  if (!email || !password) {
    return res.status(401).json(genericError);
  }

  const user = users.find((u) => u.email === email);
  if (!user) {
    return res.status(401).json(genericError);
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    return res.status(401).json(genericError);
  }

  // Issue JWT with minimal claims, 15m expiration, issuer, and audience
  const token = jwt.sign(
    {
      sub: user.id,
      role: user.role,
      branchId: user.branchId,
    },
    config.jwtSecret,
    {
      expiresIn: "15m",
      issuer: "dinedesk-api",
      audience: "dinedesk-client",
    },
  );

  res.json({ accessToken: token });
});

module.exports = router;
