const express = require("express");
const config = require("./src/config");
const authRoutes = require("./src/routes/auth");
const orderRoutes = require("./src/routes/orders");
const adminRoutes = require("./src/routes/admin");
const paymentRoutes = require("./src/routes/payments");
const authenticate = require("./src/middleware/auth");
const { requirePermission } = require("./src/middleware/rbac");

const app = express();
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);

// Direct route for branch reports matching the requirement
app.get(
  "/api/reports/branch",
  authenticate,
  requirePermission("reports:read"),
  (req, res) => {
    const targetBranch =
      req.user.role === "admin"
        ? req.query.branchId || "bole"
        : req.user.branchId;
    const { orders } = require("./src/db");
    const branchOrders = orders.filter((o) => o.branchId === targetBranch);

    res.json({
      branch: targetBranch,
      totalOrders: branchOrders.length,
      orders: branchOrders,
      generatedBy: req.user.id,
    });
  },
);

app.listen(config.port, () => {
  console.log(`DineDesk API running on port ${config.port}`);
});

module.exports = app;
