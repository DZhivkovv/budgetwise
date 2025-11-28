import { jest } from '@jest/globals';
import request from "supertest";
import app from "../../index.js";
import db from "../../models/index.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';


describe("PATCH /expense (editUserExpense)", () => {
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
  //Defining avariable that will contain the test user's expense data.
  let testExpense;
  //Defining avariable that will contain the test expense's category data.
  let testCategory;
  // Variable that contains the current date.
  const today = new Date();
  // Variable that contains the current date in format 'yyyy-mm-dd'.
  const currentDateString = today.toISOString().split("T")[0];
  
  // Before the tests have started:
  beforeAll(async () => {
    // Reset and initialize a fresh test DB
    await db.sequelize.sync({ force: true });

    // Create a test user
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    testUser = await db.User.create({
      firstName: 'Dean',
      lastName: 'Ambrose',
      age: 25,
      email: 'deanambrose@example.com',
      password: hashedPassword
    });
  
    // Add the test user's budget
    testBudget = await db.Budget.create({
      userId: testUser.id,
      amount: 1000,
      currency: "BGN",
    });

    // Add an expense category
    testCategory = await db.Category.create({
      name: "Food",
    });
  
    // Add an expense to edit
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
      { id: testUser.id }, 
      process.env.JWT_SECRET, 
      {expiresIn: "1h",}
    );
  
    // Use the test-only secret to create an expired jwt.
    expiredToken = jwt.sign(
      { id: testUser.id, email: testUser.email },
      TEST_SECRET,
      { expiresIn: '-1h' }
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

  // ---------------- SUCCESS TESTS ---------------------
  describe('Successful budget edit', () => {
    it("should edit expense successfully when valid expense data is provided", async () => {
      const res = await request(app)
        .patch("/expense")
        .set("Cookie", [`auth-token=${token}`])
        .send({
          id: testExpense.id,
          categoryId: testCategory.id,
          amount: 100,
          date: new Date(),
          isPeriodic: false,
          notes: "Updated expense",
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Successful expense edit');
    });
  })


  // ---------------- VALIDATION ERRORS ------------------
  describe('Validation errors', () => {

    it('should return 400 Bad Request when categoryId is missing', async () => {
        const res = await request(app)
          .patch('/expense')
          .set('Cookie', [`auth-token=${token}`])
          .send({
            id: testExpense.id,
            amount: 100,
            date: currentDateString,
            isPeriodic: false
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Invalid category ID.');
    });

    it('should return 400 Bad Request when amount is missing', async () => {
        const res = await request(app)
            .patch('/expense')
            .set('Cookie', [`auth-token=${token}`])
            .send({
              id: testExpense.id,
              categoryId: testCategory.id,
              date: currentDateString,
              isPeriodic: false
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Invalid expense amount');
    });

    it('should return 400 Bad Request when date is missing', async () => {
        const res = await request(app)
            .patch('/expense')
            .set('Cookie', [`auth-token=${token}`])
            .send({
              id: testExpense.id,
              categoryId: testCategory.id,
              amount: 100,
              isPeriodic: false
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Invalid expense date');
    });

    it('should return 400 Bad Request when isPeriodic is missing', async () => {
        const res = await request(app)
            .patch('/expense')
            .set('Cookie', [`auth-token=${token}`])
            .send({
              id: testExpense.id,
              categoryId: testCategory.id,
              amount: 100,
              date: currentDateString
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Invalid expenseIsPeriodic value');
    });

    it('should return 400 Bad Request when isPeriodic=true but recurringPeriod is missing', async () => {
        const res = await request(app)
            .patch('/expense')
            .set('Cookie', [`auth-token=${token}`])
            .send({
              id: testExpense.id,
              categoryId: testCategory.id,
              amount: 100,
              date: currentDateString,
              isPeriodic: true
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Invalid recurring period');
    });

    it('should return 400 Bad Request when recurringPeriod is provided but isPeriodic=false', async () => {
        const res = await request(app)
            .patch('/expense')
            .set('Cookie', [`auth-token=${token}`])
            .send({
                id: testExpense.id,
                categoryId: testCategory.id,
                amount: 100,
                date: currentDateString,
                isPeriodic: false,
                recurringPeriod: 'monthly'
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('The expense is not periodic');
    });

    it("should return 400 Bad Request when expense ID is invalid", async () => {
      const res = await request(app)
        .patch("/expense")
        .set("Cookie", [`auth-token=${token}`])
        .send({
          id: "invalid",
          categoryId: testCategory.id,
          amount: 100,
          date: new Date(),
          isPeriodic: false,
          notes: "Invalid ID test",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Expense not found.");
    });

    it("should return 400 Bad Request when updated expense exceeds available budget", async () => {
      await testBudget.update({ amount: 50 });

      const res = await request(app)
        .patch("/expense")
        .set("Cookie", [`auth-token=${token}`])
        .send({
          id: testExpense.id,
          categoryId: testCategory.id,
          amount: 1000,
          date: new Date(),
          isPeriodic: false,
          notes: "Too large expense",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("You cannot afford this expense.");
    });

    it("should return 403 Forbidden when expense is not from the current month", async () => {
      const oldExpense = await db.Expense.create({
        userId: testUser.id,
        categoryId: testCategory.id,
        amount: 100,
        date: "2025-10-01",
        isPeriodic: false,
        notes: "Old expense",
      });

      const res = await request(app)
        .patch("/expense")
        .set("Cookie", [`auth-token=${token}`])
        .send({
          id: oldExpense.id,
          categoryId: testCategory.id,
          amount: 150,
          date: "2025-10-02",
          isPeriodic: false,
          notes: "Update old expense",
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Only current month expenses can be edited.");
    });

    it("should return 404 Not Found when expense not found", async () => {
      const res = await request(app)
        .patch("/expense")
        .set("Cookie", [`auth-token=${token}`])
        .send({
          id: 9999,
          categoryId: testCategory.id,
          amount: 100,
          date: new Date(),
          isPeriodic: false,
          notes: "Nonexistent expense",
        });

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Expense not found.");
    });

    it("should return 404 Not Found when category is not found", async () => {
      const res = await request(app)
        .patch("/expense")
        .set("Cookie", [`auth-token=${token}`])
        .send({
          id: testExpense.id,
          categoryId: 9999,
          amount: 100,
          date: new Date(),
          isPeriodic: false,
          notes: "Invalid category",
        });

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Category not found.");
    });
  });


  // -------------- AUTHENTICATION ERRORS ----------------
  describe('Authentication errors', () => {
    it("should return 401 Unauthorized when token is invalid", async () => {
      const res = await request(app)
        .patch("/expense")
        .set("Cookie", [`auth-token=invalidtoken`])
        .send({
          id: testExpense.id,
          categoryId: testCategory.id,
          amount: 100,
          date: new Date(),
          isPeriodic: false,
          notes: "Invalid token test",
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Invalid or expired token");
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


  // ---------------- SERVER ERRORS ----------------
  describe('Server errors', () => {
    it("should handle unexpected server error", async () => {
      jest.spyOn(db.Expense, "findOne").mockRejectedValueOnce(new Error("Database connection failed."));

      const res = await request(app)
        .patch("/expense")
        .set("Cookie", [`auth-token=${token}`])
        .send({
          id: testExpense.id,
          categoryId: testCategory.id,
          amount: 100,
          date: new Date(),
          isPeriodic: false,
          notes: "Server error test",
        });

      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Internal server error");

      jest.restoreAllMocks();
    });
  });

});