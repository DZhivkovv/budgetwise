import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../../index.js';
import db from '../../models/index.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

describe('PATCH /budget (edit user budget)', () => {
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

  // Before the tests have started:
  beforeAll(async () => {
    // Reset and initialize a fresh test DB
    await db.sequelize.sync({ force: true });

    // Create a test user
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    testUser = await db.User.create({
      firstName: 'Rick',
      lastName: 'Flair',
      age: 25,
      email: 'rickflair@example.com',
      password: hashedPassword,
    });

    // Use the test-only secret to create a jwt.
    process.env.JWT_SECRET = TEST_SECRET;
    token = jwt.sign(
      { id: testUser.id, email: testUser.email },
      TEST_SECRET,
      { expiresIn: '1h' }
    );

    // Use the test-only secret to create an expired jwt.
    expiredToken = jwt.sign(
      { id: testUser.id, email: testUser.email },
      TEST_SECRET,
      { expiresIn: '-1h' }
    );

    // Add the test user's budget
    testBudget = await db.Budget.create({
      userId: testUser.id,
      amount: 5000,
      currency: 'BGN'
    });
  });

  // After the tests are over:
  afterAll(async () => {
    // Remove all entries in the Budget table.
    await db.Budget.destroy({ where: {} });
    // Remove all entries in the User table.
    await db.User.destroy({ where: {} });
    // Close the connection to the database.
    await db.sequelize.close();
    // Reset the jwt secret's original value.
    process.env.JWT_SECRET = ORIGINAL_SECRET;
  });

  // ---------------- SUCCESS TESTS ---------------------
  describe('Successful budget edit', () => {
    it('should successfully edit user budget with valid data', async () => {
      const res = await request(app)
        .patch('/budget')
        .set('Cookie', [`auth-token=${token}`])
        .send({
          budget: 3000,
          currency: 'BGN',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Budget edited successfully");
    });
  });

  // ---------------- VALIDATION ERRORS ------------------
  describe('Validation errors', () => {

    it('should return 404 Not Found when the user has no budget', async () => {
      await db.Budget.destroy({ where: { userId: testUser.id } });

      const res = await request(app)
        .patch('/budget')
        .set('Cookie', [`auth-token=${token}`])
        .send({
          budget: 3000,
          currency: 'BGN',
        });

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("User does not have a budget");

      testBudget = await db.Budget.create({
        userId: testUser.id,
        amount: 5000,
        currency: 'BGN'
      });
    });

    it('should return 400 when budget = 0', async () => {
      const res = await request(app)
        .patch('/budget')
        .set('Cookie', [`auth-token=${token}`])
        .send({ budget: 0, currency: 'BGN' });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        success: false,
        message: "Invalid budget value",
      });
    });

    it('should return 400 when budget is negative', async () => {
      const res = await request(app)
        .patch('/budget')
        .set('Cookie', [`auth-token=${token}`])
        .send({ budget: -5000, currency: 'BGN' });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        success: false,
        message: "Invalid budget value",
      });
    });

    it('should return 400 when budget is not a number', async () => {
      const res = await request(app)
        .patch('/budget')
        .set('Cookie', [`auth-token=${token}`])
        .send({ budget: 'not a number', currency: 'BGN' });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        success: false,
        message: "Invalid budget value",
      });
    });

    it('should return 400 when budget is empty string', async () => {
      const res = await request(app)
        .patch('/budget')
        .set('Cookie', [`auth-token=${token}`])
        .send({ budget: '', currency: 'BGN' });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        success: false,
        message: "Invalid budget value",
      });
    });

    it('should return 400 when currency is invalid', async () => {
      const res = await request(app)
        .patch('/budget')
        .set('Cookie', [`auth-token=${token}`])
        .send({ budget: 5000, currency: 'RON' });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        success: false,
        message: "Invalid currency value",
      });
    });

    it('should return 400 when currency is empty string', async () => {
      const res = await request(app)
        .patch('/budget')
        .set('Cookie', [`auth-token=${token}`])
        .send({ budget: 5000, currency: '' });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        success: false,
        message: "Invalid currency value",
      });
    });
  });

  // -------------- AUTHENTICATION ERRORS ----------------
  describe('Authentication errors', () => {

    it('should return 401 when token is missing', async () => {
      const res = await request(app).patch('/budget');

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({
        success: false,
        message: "Unauthorized"
      });
    });

    it('should return 401 when token is invalid', async () => {
      const res = await request(app)
        .patch('/budget')
        .set('Cookie', [`auth-token=invalidtoken`]);

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({
        success: false,
        message: "Invalid or expired token",
      });
    });

    it('should return 401 when token is expired', async () => {
      const res = await request(app)
        .patch('/budget')
        .set('Cookie', [`auth-token=${expiredToken}`])
        .send({ budget: 2000, currency: 'BGN' });

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({
        success: false,
        message: "Invalid or expired token",
      });
    });
  });

  // ---------------- SERVER ERRORS ----------------
  describe('Server errors', () => {

    it('should handle unexpected errors ', async () => {
      jest.spyOn(db.Budget, 'findOne').mockRejectedValueOnce(
        new Error('Database connection failed.')
      );

      const res = await request(app)
        .patch('/budget')
        .set('Cookie', [`auth-token=${token}`])

      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Internal server error');

      jest.restoreAllMocks();
    });

  });

});

