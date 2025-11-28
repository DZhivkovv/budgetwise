import { jest } from '@jest/globals';
import request from "supertest";
import app from "../../index.js";
import db from "../../models/index.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';

describe("DELETE /expense (delete user expense)", () => {
  // Preserves original secret.
  const ORIGINAL_SECRET = process.env.JWT_SECRET;
  // Defines test-only secret.
  const TEST_SECRET = 'test_secret';
  //Defining avariable that will contain jwt.
  let token;
  //Defining avariable that will contain expired jwt.
  let expiredToken;
  //Defining avariable that will contain test user data.
  let testUser;
  //Defining avariable that will contain the test user's budget data.
  let testBudget;
  //Defining avariable that will contain expense that will be deleted in the tests.
  let testExpense;
  //Defining avariable that will contain expense category data.
  let testCategory;

  // Before the tests have started:
  beforeAll(async () => {
    // Reset and initialize a fresh test DB
    await db.sequelize.sync({ force: true });

    // Create a test user
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    testUser = await db.User.create({
      firstName: 'Bray',
      lastName: 'Wyatt',
      age: 25,
      email: 'braywyatt@example.com',
      password: hashedPassword,
    });

    // Add the test user's budget
    testBudget = await db.Budget.create({
      userId: testUser.id,
      amount: 3000,
      currency: "BGN",
    });

    // Add expense category data.
    testCategory = await db.Category.create({
      name: "Groceries",
    });

    // Add test expense data.
    testExpense = await db.Expense.create({
      userId: testUser.id,
      categoryId: testCategory.id,
      amount: 50,
      date: new Date(),
      isPeriodic: false,
      notes: "Initial expense",
    });

    // Use the test-only secret to create a jwt.
    process.env.JWT_SECRET = TEST_SECRET;
    token = jwt.sign(
      { id: testUser.id, email: testUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Use the test-only secret to create an expired jwt.
    expiredToken = jwt.sign(
      { id: testUser.id, email: testUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '-1h' } // вече изтекъл токен
    );
  });

  // After the tests are over:
  afterAll(async () => {
    // Remove all entries in the Budget table.
    await db.Budget.destroy({ where: {} });
    // Remove all entries in the User table.
    await db.User.destroy({ where: {} });
    // Remove all entries in the Category table.
    await db.Category.destroy({ where: {} });
    // Remove all entries in the Expense table.
    await db.Expense.destroy({ where: {} });
    // Close the connection to the database.
    await db.sequelize.close();
    // Reset the jwt secret's original value.
    process.env.JWT_SECRET = ORIGINAL_SECRET;
  });
  
  // After each test is over:
  afterEach(async () => {
    // Restore all mocks.
    jest.restoreAllMocks();
  });

  // ---------------- SUCCESS TESTS ---------------------
  describe('Successful expense deletion', () => {

    it("should delete expense successfully when valid expense ID is provided", async () => {
      const res = await request(app)
        .delete("/expense")
        .set("Cookie", [`auth-token=${token}`])
        .send({ id: testExpense.id });

      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Expense deleted successfully.");
    });

    
  });

  // ---------------------- VALIDATION ERRORS ----------------------
  describe('Validation errors', () => {
    it("should return 400 Bad Request when expense ID is null", async () => {
      const res = await request(app)
        .delete("/expense")
        .set("Cookie", [`auth-token=${token}`])
        .send({ id: null });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Expense not found.");
    });

    it("should return 400 Bad Request when expense ID is an empty object", async () => {
      const res = await request(app)
        .delete("/expense")
        .set("Cookie", [`auth-token=${token}`])
        .send({ id: {} });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Expense not found.");
    });

    it("should return 400 Bad Request when expense ID is array", async () => {
      const res = await request(app)
        .delete("/expense")
        .set("Cookie", [`auth-token=${token}`])
        .send({ id: [] });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Expense not found.");
    });

    it("should return 400 Bad Request when expense ID is empty string", async () => {
      const res = await request(app)
        .delete("/expense")
        .set("Cookie", [`auth-token=${token}`])
        .send({ id: '' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Expense not found.");
    });

    it("should return 400 Bad Request when expense ID is undefined", async () => {
      const res = await request(app)
        .delete("/expense")
        .set("Cookie", [`auth-token=${token}`])
        .send({ id: undefined });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Expense not found.");
    });

    it("should return 400 Bad Request when expense ID is a string", async () => {
      const res = await request(app)
        .delete("/expense")
        .set("Cookie", [`auth-token=${token}`])
        .send({ id: 'invalid value' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Expense not found.");
    });

    it("should return 403 Forbidden when expense is from previous month", async () => {
      // Create an expense from previous month
      const lastMonthDate = new Date();
      lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);

      const oldExpense = await db.Expense.create({
        userId: testUser.id,
        categoryId: testCategory.id,
        amount: 40,
        date: lastMonthDate,
        isPeriodic: false,
        notes: "Old expense",
      });

      const res = await request(app)
        .delete("/expense")
        .set("Cookie", [`auth-token=${token}`])
        .send({ id: oldExpense.id });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Only current month expenses can be deleted.");
    });

    it("should return 404 Not Found when deleting another user's expense", async () => {
      // Create second user
      const hashedPass = await bcrypt.hash('RandomPass123!', 10);
      const otherUser = await db.User.create({
        firstName: 'Roman',
        lastName: 'Reigns',
        age: 30,
        email: 'roman@example.com',
        password: hashedPass,
      });

      // Create second user's budget
      await db.Budget.create({
        userId: otherUser.id,
        amount: 2500,
        currency: "BGN",
      });

      // Create expense for second user
      const otherUserExpense = await db.Expense.create({
        userId: otherUser.id,
        categoryId: testCategory.id,
        amount: 99,
        date: new Date(),
        isPeriodic: false,
      });

      const res = await request(app)
        .delete("/expense")
        .set("Cookie", [`auth-token=${token}`])
        .send({ id: otherUserExpense.id });

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Expense not found.");
    });

    it("should return 404 Not Found when expense does not exist", async () => {
      const res = await request(app)
        .delete("/expense")
        .set("Cookie", [`auth-token=${token}`])
        .send({ id: 999999 });

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Expense not found.");
    });

    it("should return 404 when user has no budget", async () => {
      // Delete user budget
      await db.Budget.destroy({ where: { userId: testUser.id } });

      const res = await request(app)
        .delete("/expense")
        .set("Cookie", [`auth-token=${token}`])
        .send({ id: testExpense.id });

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("No budget found.");

      // Restore user budget for the other tests
      await db.Budget.create({
        userId: testUser.id,
        amount: 3000,
        currency: "BGN",
      });
    });    
  });

  // ---------------------- AUTHENTICATION ERRORS ----------------------
  describe('Authentication errors', () => {

    it('should return 401 Unauthorized when user is not authenticated', async () => {
      const res = await request(app)
        .post('/budget')
        .send({
          budget: 2000,
          currency: 'BGN',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({
        success: false,
        message: "Unauthorized",
      });
    });

    it('should return 401 Unauthorized when auth token is invalid', async () => {
      const res = await request(app)
        .delete('/expense')
        .set('Cookie', [`auth-token=invalidtoken`])
        .send({id:testExpense.id});

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({
        success: false,
        message: "Invalid or expired token",
      });
    });

    it('should return 401 Unauthorized when token is expired', async () => {
      const res = await request(app)
        .delete('/expense')
        .set('Cookie', [`auth-token=${expiredToken}`])
        .send({id: testExpense.id});

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({
        success: false,
        message: "Invalid or expired token",
      });
    });
  });

  // ---------------------- SERVER ERRORS ----------------------
  describe('Server errors', () => {
    it('should handle unexpected internal server error', async () => {
      jest.spyOn(db.Expense, 'findOne').mockRejectedValueOnce(
          new Error('Database failure.')
      );
          
      const res = await request(app)
        .delete('/expense')
        .set('Cookie', [`auth-token=${token}`])
        .send({
          id: testExpense.id
        });

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({
        success: false,
        message: "Internal server error",
      });

      db.Expense.findOne.mockRestore();
    });
  });

});
