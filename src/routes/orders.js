const express = require("express");
const authenticate = require("../middleware/auth");
const { requirePermission } = require("../middleware/rbac");
const { orders } = require("../db");

const router = express.Router();

// Task 4.1: Policy function for branch-level object authorization
function canAccessOrder(user, order) {
  if (user.role === "admin") return true; // Admins can access all
  return user.branchId === order.branchId; // Non-admins restricted to their own branch
}
//function canAccessOrder(user, order) {
// return true; // Broken on purpose}
// GET /api/orders - Any authenticated staff (scoped by branch for non-admins)
router.get("/", authenticate, (req, res) => {
  if (req.user.role === "admin") {
    return res.json(orders);
  }
  const scopedOrders = orders.filter((o) => o.branchId === req.user.branchId);
  res.json(scopedOrders);
});

// GET /api/orders/:id - Requires orders:read permission + branch policy check
router.get(
  "/:id",
  authenticate,
  requirePermission("orders:read"),
  (req, res) => {
    const orderId = parseInt(req.params.id);
    const order = orders.find((o) => o.id === orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Enforce branch-level security policy
    if (!canAccessOrder(req.user, order)) {
      // Task 4.3: Deciding 403 vs 404. Using 404 to prevent resource enumeration.
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  },
);

// POST /api/orders - Requires orders:create permission
router.post(
  "/",
  authenticate,
  requirePermission("orders:create"),
  (req, res) => {
    const { item } = req.body;
    if (!item) {
      return res.status(400).json({ error: "Item description is required" });
    }

    const newOrder = {
      id: orders.length + 1,
      branchId: req.user.branchId || "bole", // Defaults to creator's branch
      item,
      status: "pending",
      createdBy: req.user.id,
    };

    orders.push(newOrder);
    res.status(201).json(newOrder);
  },
);

// GET /api/orders/reports/branch (or update your test URL to match how it's mounted)
router.get(
  "/reports/branch",
  authenticate,
  requirePermission("reports:read"),
  (req, res) => {
    const targetBranch =
      req.user.role === "admin"
        ? req.query.branchId || "bole"
        : req.user.branchId;
    const branchOrders = orders.filter((o) => o.branchId === targetBranch);

    res.json({
      branch: targetBranch,
      totalOrders: branchOrders.length,
      orders: branchOrders,
      generatedBy: req.user.id,
    });
  },
);

module.exports = router;
