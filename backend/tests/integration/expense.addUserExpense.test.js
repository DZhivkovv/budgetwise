import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../../index.js';
import db from '../../models/index.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

describe('POST /expense (add user expense)', () => {
  // Preserves original secret.
  const ORIGINAL_SECRET = process.env.JWT_SECRET;
  // Defines test-only secret.
  const TEST_SECRET = 'test_secret';
  //Defining a variable that will contain jwt.
  let token;
  //Defining a variable that will contain expired jwt.
  let expiredToken;
  //Defining a variable that will contain test user data.
  let testUser;
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
      firstName: 'Roman',
      lastName: 'Reigns',
      age: 25,
      email: 'romanreigns@example.com',
      password: hashedPassword,
    });

    // Add testUser's budget
    testBudget = await db.Budget.create({
        userId: testUser.id,
        amount:3000,
        currency: 'BGN'
    });

    // Add expense category
    testCategory = await db.Category.create({name: 'Bills'});

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

  // After all tests are over:
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


  // --- TESTS ------------------------------------------------------

  // ---------------------- SUCCESSFUL TESTS ----------------------
  describe('Successful expense add', () => {

    it('should add periodic user expense successfully when valid expense data is provided', async () => {
      const res = await request(app)
        .post('/expense')
        .set('Cookie', [`auth-token=${token}`])
        .send({
          categoryId: 1,
          amount: 50,
          date: currentDateString,
          isPeriodic: true,
          recurringPeriod: 'weekly'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('User expense added successfully!');
      expect(res.body.data.expense.isPeriodic).toBe(true);
      expect(res.body.data.expense.recurringPeriod).toBe('weekly');
      expect(res.body.data.expense.nextDueDate).toBeDefined();
    });

    it('should add non-periodic user expense successfully when valid expense data is provided', async () => {
      const res = await request(app)
        .post('/expense')
        .set('Cookie', [`auth-token=${token}`])
        .send({
          categoryId: 1,
          amount: 100,
          date: currentDateString,
          isPeriodic: false
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('User expense added successfully!');
    });    

    it('should add non-periodic user expense successfully when the expense is equal to the budget amount', async () => {
      const res = await request(app)
        .post('/expense')
        .set('Cookie', [`auth-token=${token}`])
        .send({
          categoryId: 1,
          amount: 2800,
          date: currentDateString,
          isPeriodic: false
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('User expense added successfully!');
    });    
  });


  // ---------------------- VALIDATION ERRORS ----------------------
  describe('Validation errors', () => {

    it('should return 400 Bad Request when categoryId is missing', async () => {
        const res = await request(app)
          .post('/expense')
          .set('Cookie', [`auth-token=${token}`])
          .send({
            amount: 100,
            date: currentDateString,
            isPeriodic: false
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Invalid expense category ID.');
    });

    it('should return 400 Bad Request when amount is missing', async () => {
        const res = await request(app)
            .post('/expense')
            .set('Cookie', [`auth-token=${token}`])
            .send({
                categoryId: 1,
                date: currentDateString,
                isPeriodic: false
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Invalid expense amount');
    });

    it('should return 400 Bad Request when date is missing', async () => {
        const res = await request(app)
            .post('/expense')
            .set('Cookie', [`auth-token=${token}`])
            .send({
                categoryId: 1,
                amount: 100,
                isPeriodic: false
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Invalid expense date');
    });

    it('should return 400 Bad Request when isPeriodic is missing', async () => {
        const res = await request(app)
            .post('/expense')
            .set('Cookie', [`auth-token=${token}`])
            .send({
                categoryId: 1,
                amount: 100,
                date: currentDateString
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Invalid expenseIsPeriodic value');
    });

    it('should return 400 Bad Request when isPeriodic=true but recurringPeriod is missing', async () => {
        const res = await request(app)
            .post('/expense')
            .set('Cookie', [`auth-token=${token}`])
            .send({
                categoryId: 1,
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
            .post('/expense')
            .set('Cookie', [`auth-token=${token}`])
            .send({
                categoryId: 1,
                amount: 100,
                date: currentDateString,
                isPeriodic: false,
                recurringPeriod: 'monthly'
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('The expense is not periodic');
    });

    it('should return 404 Not Found when the user has no budget', async () => {
      // Remove the user's budget for this test.
      await db.Budget.destroy({where: {userId: testUser.id}});

      const res = await request(app)
        .post('/expense')
        .set('Cookie', [`auth-token=${token}`])
        .send({
          categoryId: 1,
          amount: 10,
          date: currentDateString,
          isPeriodic: false
        });


      // Add the user's budget again.
      await request(app)
        .post('/budget')
        .set('Cookie', [`auth-token=${token}`])
        .send({
          budget: 3000,
          currency: 'BGN',
        });
           
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('No budget found.');
    });

    it('should return 400 Bad Request when the expense does not have a valid date', async () => {
      const res = await request(app)
        .post('/expense')
        .set('Cookie', [`auth-token=${token}`])
        .send({
          categoryId: 1,
          amount: 10,
          date: 'not a date',
          isPeriodic: false
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid expense date');
    });

    it('should return 400 Bad Request when the expense is more than the user budget', async () => {
      const res = await request(app)
        .post('/expense')
        .set('Cookie', [`auth-token=${token}`])
        .send({
          categoryId: 1,
          amount: 3001,
          date: currentDateString,
          isPeriodic: false
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('You cannot afford this expense.');
    });

    it('should return 403 Forbidden when the expense is from the last month', async () => {
      const previousMonthDate = new Date(today);
      previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);
      const previousMonthString = previousMonthDate.toISOString().split("T")[0];

      const res = await request(app)
        .post('/expense')
        .set('Cookie', [`auth-token=${token}`])
        .send({
          categoryId: 1,
          amount: 10,
          date: previousMonthString,
          isPeriodic: false
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Expenses can be added only for the current month.');
    });

    it('should return 403 Forbidden when the expense is from the next month', async () => {
      const nextMonthDate = new Date(today);
      nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
      const nextMonthString = nextMonthDate.toISOString().split("T")[0];

      const res = await request(app)
        .post('/expense')
        .set('Cookie', [`auth-token=${token}`])
        .send({
          categoryId: 1,
          amount: 10,
          date: nextMonthString,
          isPeriodic: false
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Expenses can be added only for the current month.');
    });

    it('should return 404 Not Found when expense category is not found', async () => {
      const res = await request(app)
        .post('/expense')
        .set('Cookie', [`auth-token=${token}`])
        .send({
          categoryId: 100,
          amount: 10,
          date: currentDateString,
          isPeriodic: false
        });

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Category not found.');
    });
    


  });

  // ---------------------- AUTHENTICATION ERRORS ----------------------
  describe('Authentication errors', () => {
    it('should return 401 Unauthorized when user is not authenticated', async () => {
      const res = await request(app)
        .post('/expense')
        .send({
          categoryId: 1,
          amount: 10,
          date: '2025-11-08',
          isPeriodic: false
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Unauthorized');
    });
    

    it('should return 401 Unauthorized when the auth token is invalid', async () => {
      const res = await request(app)
        .post('/expense')
        .set('Cookie', [`auth-token=invalid`])
        .send({
          categoryId: 1,
          amount: 10,
          date: '2025-11-08',
          isPeriodic: false
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid or expired token');
    });

    it('should return 401 Unauthorized when the token is expired', async () => {
      const res = await request(app)
        .post('/expense')
        .set('Cookie', [`auth-token=${expiredToken}`])
        .send({
          categoryId: 1,
          amount: 10,
          date: '2025-11-08',
          isPeriodic: false
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid or expired token');
    });
  });


  // ---------------------- SERVER ERRORS ----------------------
  describe('Server errors', () => {
    it('should handle unexpected internal server error', async () => {
      jest.spyOn(db.Category, 'findOne').mockRejectedValueOnce(
          new Error('Database failure.')
      );
          
      const res = await request(app)
        .post('/expense')
        .set('Cookie', [`auth-token=${token}`])
        .send({
          categoryId: 1,
          amount: 10,
          date: '2025-11-08',
          isPeriodic: false
        });

      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Internal server error');

      jest.restoreAllMocks();
    });
  });
});
