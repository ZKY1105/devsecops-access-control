const express = require("express");
const authenticate = require("../middleware/auth");
const { requireRole } = require("../middleware/rbac");
const { users } = require("../db");

const router = express.Router();

// GET /api/admin/users - Restricted to admin role, stripping out password hashes
router.get("/users", authenticate, requireRole("admin"), (req, res) => {
  const safeUsers = users.map(
    ({ passwordHash, ...userWithoutPassword }) => userWithoutPassword,
  );
  res.json(safeUsers);
});

module.exports = router;
