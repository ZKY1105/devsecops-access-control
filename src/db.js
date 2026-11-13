const bcrypt = require("bcrypt");

// Pre-hashed passwords for testing (Plaintext equivalent: "Password123!")
const hashedPassword = bcrypt.hashSync("Password123!", 10);

const users = [
  {
    id: 1,
    email: "admin@dinedesk.com",
    passwordHash: hashedPassword,
    role: "admin",
    branchId: null,
  },
  {
    id: 2,
    email: "manager.bole@dinedesk.com",
    passwordHash: hashedPassword,
    role: "manager",
    branchId: "bole",
  },
  {
    id: 3,
    email: "manager.piassa@dinedesk.com",
    passwordHash: hashedPassword,
    role: "manager",
    branchId: "piassa",
  },
  {
    id: 4,
    email: "waiter.bole@dinedesk.com",
    passwordHash: hashedPassword,
    role: "waiter",
    branchId: "bole",
  },
  {
    id: 5,
    email: "waiter.piassa@dinedesk.com",
    passwordHash: hashedPassword,
    role: "waiter",
    branchId: "piassa",
  },
  {
    id: 6,
    email: "cashier.bole@dinedesk.com",
    passwordHash: hashedPassword,
    role: "cashier",
    branchId: "bole",
  },
];

const orders = [
  { id: 1, branchId: "bole", item: "Tibs", status: "pending", createdBy: 4 },
  { id: 2, branchId: "bole", item: "Kitfo", status: "completed", createdBy: 4 },
  {
    id: 3,
    branchId: "piassa",
    item: "Doro Wat",
    status: "pending",
    createdBy: 5,
  },
  {
    id: 4,
    branchId: "piassa",
    item: "Beyenetu",
    status: "completed",
    createdBy: 5,
  },
];

module.exports = { users, orders };
