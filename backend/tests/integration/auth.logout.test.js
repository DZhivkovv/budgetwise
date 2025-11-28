import request from "supertest";
import app from "../../index.js";
import db from "../../models/index.js";
import jwt from "jsonwebtoken";

describe("GET /auth/logout", () => {
  // Initialize a variable that will contain a valid JWT.
  let token;
  // Preserves original secret.
  const ORIGINAL_SECRET = process.env.JWT_SECRET;
  // Defines test-only secret.
  const TEST_SECRET = "test_secret";

  // Before the tests have started:
  beforeAll(async () => {
    // Reset and initialize a fresh DB
    await db.sequelize.sync({ force: true });
    // Use the test-only secret.
    process.env.JWT_SECRET = TEST_SECRET;

    // Create a valid JWT.
    token = jwt.sign(
      { id: 1, email: "test@example.com" },
      TEST_SECRET,
      { expiresIn: "1h" }
    );
  });

  // After the tests are over:
  afterAll(async () => {
    // Reset the jwt secret's original value.
    process.env.JWT_SECRET = ORIGINAL_SECRET;
    // Close the connection to the database.
    await db.sequelize.close();
  });

  // --- TESTS ------------------------------------------------------
  
  it("should logout successfully and clear the auth cookie", async () => {
    const res = await request(app)
      .get("/auth/logout")
      .set("Cookie", [`auth-token=${token}`]);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    expect(res.headers["set-cookie"][0]).toMatch(/^auth-token=;/);
  });

  it("should still return success even if no cookie is provided", async () => {
    const res = await request(app).get("/auth/logout");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
