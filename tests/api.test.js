const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../server");
const config = require("../src/config");

// Helper to generate valid tokens for testing
function generateToken(payload, secret = config.jwtSecret, expiresIn = "15m") {
  return jwt.sign(payload, secret, {
    expiresIn,
    issuer: "dinedesk-api",
    audience: "dinedesk-client",
  });
}

describe("DineDesk Security & Authorization Test Suite", () => {
  // Test tokens for various roles and branches
  const adminToken = generateToken({ sub: 1, role: "admin", branchId: null });
  const boleManagerToken = generateToken({
    sub: 2,
    role: "manager",
    branchId: "bole",
  });
  const piassaManagerToken = generateToken({
    sub: 3,
    role: "manager",
    branchId: "piassa",
  });
  const boleWaiterToken = generateToken({
    sub: 4,
    role: "waiter",
    branchId: "bole",
  });
  const cashierToken = generateToken({
    sub: 6,
    role: "cashier",
    branchId: "bole",
  });

  // 1. No token -> 401
  test("1. GET /api/orders without token returns 401", async () => {
    const res = await request(app).get("/api/orders");
    expect(res.statusCode).toBe(401);
  });

  // 2. Token signed with the wrong key -> 401
  test("2. GET /api/orders with wrong signing key returns 401", async () => {
    const wrongKeyToken = generateToken(
      { sub: 4, role: "waiter", branchId: "bole" },
      "wrong_secret_key_that_is_long_enough_32_chars",
    );
    const res = await request(app)
      .get("/api/orders")
      .set("Authorization", `Bearer ${wrongKeyToken}`);
    expect(res.statusCode).toBe(401);
  });

  // 3. Expired token -> 401
  test("3. GET /api/orders with expired token returns 401", async () => {
    const expiredToken = generateToken(
      { sub: 4, role: "waiter", branchId: "bole" },
      config.jwtSecret,
      "-10s",
    );
    const res = await request(app)
      .get("/api/orders")
      .set("Authorization", `Bearer ${expiredToken}`);
    expect(res.statusCode).toBe(401);
  });

  // 4. Waiter calling GET /api/admin/users -> 403
  test("4. Waiter calling GET /api/admin/users returns 403", async () => {
    const res = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${boleWaiterToken}`);
    expect(res.statusCode).toBe(403);
  });

  // 5. Administrator calling GET /api/admin/users -> 200, no password hashes
  test("5. Admin calling GET /api/admin/users returns 200 without password hashes", async () => {
    const res = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    res.body.forEach((user) => {
      expect(user).not.toHaveProperty("passwordHash");
    });
  });

  // 6. Waiter creating an order -> 201
  test("6. Waiter creating an order returns 201", async () => {
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${boleWaiterToken}`)
      .send({ item: "Shiro Special" });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("item", "Shiro Special");
  });

  // 7. Cashier creating an order -> 403
  test("7. Cashier creating an order returns 403", async () => {
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${cashierToken}`)
      .send({ item: "Burger" });
    expect(res.statusCode).toBe(403);
  });

  // 8. Bole manager reading a Bole order -> 200
  test("8. Bole manager reading a Bole order returns 200", async () => {
    const res = await request(app)
      .get("/api/orders/1") // Order 1 is Bole branch in seed data
      .set("Authorization", `Bearer ${boleManagerToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.branchId).toBe("bole");
  });

  // 9. Bole manager reading a Piassa order -> denied (404/403)
  test("9. Bole manager reading a Piassa order is denied", async () => {
    const res = await request(app)
      .get("/api/orders/3") // Order 3 is Piassa branch in seed data
      .set("Authorization", `Bearer ${boleManagerToken}`);
    expect(res.statusCode).toBe(404); // Enforced 404 to prevent enumeration
  });

  // 10. Waiter calling GET /api/reports/branch -> 403
  test("10. Waiter calling GET /api/reports/branch returns 403", async () => {
    const res = await request(app)
      .get("/api/reports/branch")
      .set("Authorization", `Bearer ${boleWaiterToken}`);
    expect(res.statusCode).toBe(403);
  });

  // 11. Piassa manager calling /api/reports/branch?branchId=bole -> still only Piassa's data
  test("11. Piassa manager querying query param branchId=bole still receives Piassa data", async () => {
    const res = await request(app)
      .get("/api/reports/branch?branchId=bole")
      .set("Authorization", `Bearer ${piassaManagerToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.branch).toBe("piassa"); // Verified identity overrides query param injection
  });

  // 12. Valid login -> 200 with access token
  test("12. POST /api/auth/login with valid credentials returns access token", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "manager.bole@dinedesk.com", password: "Password123!" });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("accessToken");
  });
});
