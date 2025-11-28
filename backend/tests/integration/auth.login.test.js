import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../../index.js';
import db from '../../models/index.js';
import bcrypt from 'bcrypt';

describe('POST /auth/login (Login user)', () => {
  // Defines a variables that will contain test user data.
  let testUser;

  // Before the tests have started:
  beforeAll(async () => {
    // Reset and initialize a fresh test DB
    await db.sequelize.sync({ force: true });

    // Create a test user account to login with
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    testUser = await db.User.create({
      firstName: 'John',
      lastName: 'Doe',
      age: 25,
      email: 'john@example.com',
      password: hashedPassword,
    });
  });

  // After the tests are over:
  afterAll(async () => {
    // Remove the test user from the database
    await db.User.destroy({ where: { id: testUser.id } });
    // Close the connection to the database.
    await db.sequelize.close();
  });

  // --- TESTS ------------------------------------------------------

  // ---------------------- SUCCESSFUL TESTS ----------------------
  describe('Successful login', () => {
    it('should authenticate user successfully', async () => {
      // Login with the newly-created user account.
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'john@example.com',
          password: 'Password123!',
        });

      // Check that cookie is set
      expect(res.headers['set-cookie']).toBeDefined();

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('User logged in successfully');
      expect(res.body.data).toEqual({
        id: testUser.id,
        email: testUser.email,
        firstName: testUser.firstName,
      });
    });
  });

  // ---------------------- VALIDATION ERRORS ----------------------
  describe('Validation errors', () => {
    it('should return 400 Bad Request when email is not provided', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: '',
          password: 'Password1234!',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Email is required');
    });

    it('should return 400 Bad Request when password is not provided', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'john@example.com',
          password: '',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Password is required');
    });
  });

  // ---------------------- AUTHENTICATION ERRORS ----------------------
  describe('Authentication errors', () => {
    it('should return 401 Unauthorized when the email is wrong', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'notjohn@example.com',
          password: 'Password123!',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid email or password');
    });

    it('should return 401 Unauthorized when the password is wrong', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'john@example.com',
          password: 'Password1234!',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid email or password');
    });
  });

  // ---------------------- SERVER ERRORS ----------------------
  describe('Server errors', () => {
    it('should reject on server error', async () => {
      // Force DB findOne to fail
      const findOneMock = jest
        .spyOn(db.User, 'findOne')
        .mockRejectedValueOnce(new Error('Database connection failed.'));

      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'john@example.com',
          password: 'Password123!',
        });

      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Internal server error');

      // Restore mocks
      findOneMock.mockRestore();
    });
  });
});
