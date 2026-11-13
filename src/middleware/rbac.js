// Task 3.4: Permissions table mapping roles to named permissions
const rolePermissions = {
  waiter: ["orders:create", "orders:read"],
  cashier: ["orders:read", "payments:create"],
  manager: ["orders:read", "reports:read"],
  admin: ["users:manage", "orders:read", "reports:read"],
};

// Task 3.5: Middleware to check specific named permissions
function requirePermission(permission) {
  return (req, res, next) => {
    const userRole = req.user && req.user.role;
    const permissions = rolePermissions[userRole] || []; // Unknown role gets empty array (no permissions)

    if (!permissions.includes(permission)) {
      return res
        .status(403)
        .json({ error: "Forbidden: Insufficient permissions" });
    }
    next();
  };
}

// Task 3.5: Middleware to check specific roles
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const userRole = req.user && req.user.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return res
        .status(403)
        .json({ error: "Forbidden: Required role missing" });
    }
    next();
  };
}

module.exports = { rolePermissions, requirePermission, requireRole };
