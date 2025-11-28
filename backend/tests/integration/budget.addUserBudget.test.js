import { afterEach, jest } from '@jest/globals';
import request from 'supertest';
import app from '../../index.js';
import db from '../../models/index.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

describe('POST /budget (add user budget)', () => {
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
      { expiresIn: '-1h' }
    );
  });

  // After each test is over:
  afterEach(async ()=>{
    // Remove the created budget data
    await db.Budget.destroy( { where: {userId: testUser.id }} )
  })

  // After all tests are over:
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

  // --- TESTS ------------------------------------------------------

  // ---------------------- SUCCESSFUL TESTS ----------------------
  describe('Successful budget add', () => {

    it('should successfully add user budget when valid budget data is provided', async () => {
      const res = await request(app)
        .post('/budget')
        .set('Cookie', [`auth-token=${token}`])
        .send({
          budget: 2000,
          currency: 'BGN',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Budget added successfully');
    });
    
  });

  // ---------------------- VALIDATION ERRORS ----------------------
  describe('Validation errors', () => {
    it('should return 409 Conflict when user already has a budget', async () => {
      // Add a budget
      await request(app)
        .post('/budget')
        .set('Cookie', [`auth-token=${token}`])
        .send({ budget: 2000, currency: 'BGN' });

      // Try to add budget again
      const res = await request(app)
        .post('/budget')
        .set('Cookie', [`auth-token=${token}`])
        .send({ budget: 5000, currency: 'BGN' });

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('User already has a budget');
    });

    it('should return 400 Bad Request when budget is a negative number', async () => {
      const res = await request(app)
        .post('/budget')
        .set('Cookie', [`auth-token=${token}`])
        .send({ budget: -5000, currency: 'BGN' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid budget value');
    });

    it('should return 400 Bad Request when budget is zero', async () => {
      const res = await request(app)
        .post('/budget')
        .set('Cookie', [`auth-token=${token}`])
        .send({ budget: 0, currency: 'BGN' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid budget value');
    });

    it('should return 400 Bad Request when budget is not a number', async () => {
      const res = await request(app)
        .post('/budget')
        .set('Cookie', [`auth-token=${token}`])
        .send({ budget: 'not a number', currency: 'BGN' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid budget value');
    });

    it('should return 400 Bad Request when budget is not provided (is an empty string)', async () => {
      const res = await request(app)
        .post('/budget')
        .set('Cookie', [`auth-token=${token}`])
        .send({ budget: '', currency: 'BGN' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid budget value');
    });

    it('should return 400 Bad Request when currency is not BGN, EUR or USD', async () => {
      const res = await request(app)
        .post('/budget')
        .set('Cookie', [`auth-token=${token}`])
        .send({ budget: 5000, currency: 'RON' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid currency value');
    });

    it('should return 400 Bad Request when currency is lowercase', async () => {
      const res = await request(app)
        .post('/budget')
        .set('Cookie', [`auth-token=${token}`])
        .send({
          budget: 2000,
          currency: 'bgn',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid currency value');
    });

    it('should return 400 Bad Request when currency is not provided (is an empty string)', async () => {
      const res = await request(app)
        .post('/budget')
        .set('Cookie', [`auth-token=${token}`])
        .send({ budget: 5000, currency: '' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid currency value');
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
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Unauthorized');
    });

    it('should return 401 Unauthorized when auth token is invalid', async () => {
      const res = await request(app)
        .post('/budget')
        .set('Cookie', [`auth-token=invalid`])
        .send({
          budget: 2000,
          currency: 'BGN',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid or expired token');
    });

    it('should reject if token is expired', async () => {
      const res = await request(app)
        .post('/budget')
        .set('Cookie', [`auth-token=${expiredToken}`])
        .send({
          budget: 2000,
          currency: 'BGN',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid or expired token');
    });

  });

  // ---------------------- SERVER ERRORS ----------------------
  describe('Server errors', () => {
    it('should handle unexpected errors', async () => {
      jest.spyOn(db.Budget, 'findOne').mockRejectedValueOnce(
        new Error('Database failure.')
      );
              
      const res = await request(app)
        .post('/budget')
        .set('Cookie', [`auth-token=${token}`])
        .send({
          budget: 2000,
          currency: 'BGN',
        });

      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Internal server error');

      jest.restoreAllMocks();
    });
  });

});
