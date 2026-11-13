const express = require("express");
const authenticate = require("../middleware/auth");
const { requirePermission } = require("../middleware/rbac");

const router = express.Router();

router.post(
  "/",
  authenticate,
  requirePermission("payments:create"),
  (req, res) => {
    const { orderId, amount } = req.body;
    res
      .status(201)
      .json({ message: "Payment processed successfully", orderId, amount });
  },
);

module.exports = router;
