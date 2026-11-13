const jwt = require("jsonwebtoken");
const config = require("../config");
const { users } = require("../db");

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const parts = authHeader.split(" ");

  // Task 3.3: Accept ONLY "Authorization: Bearer <token>"
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res
      .status(401)
      .json({ error: "Unauthorized: Missing or malformed token header" });
  }

  const token = parts[1];

  try {
    // Task 3.3: jwt.verify with explicit algorithm allowlist, issuer, and audience
    const payload = jwt.verify(token, config.jwtSecret, {
      algorithms: ["HS256"],
      issuer: "dinedesk-api",
      audience: "dinedesk-client",
    });

    // Lookup user from internal records to ensure validity
    const user = users.find((u) => u.id === payload.sub);
    if (!user) {
      return res
        .status(401)
        .json({ error: "Unauthorized: User no longer exists" });
    }

    // Set req.user exclusively from verified token and database records (Never from headers/body/query)
    req.user = {
      id: user.id,
      role: user.role,
      branchId: user.branchId,
    };

    next();
  } catch (err) {
    // Returns 401 for any missing, malformed, expired, or invalid token
    return res
      .status(401)
      .json({ error: "Unauthorized: Invalid or expired token" });
  }
}

module.exports = authenticate;
