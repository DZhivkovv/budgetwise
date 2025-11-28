import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../../index.js';
import db from '../../models/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

describe('PATCH /auth (Edit User Data)', () => {
  // Preserves original secret and defines test-only secret
  const ORIGINAL_SECRET = process.env.JWT_SECRET;
  const TEST_SECRET = 'test_secret';

  // Defines variables that will contain JSON Web Token and test user data
  let token;
  let testUser;

  // Before the tests have started:
  beforeAll(async () => {
    // Resets and initializes a fresh test DB
    await db.sequelize.sync({ force: true });
    // Temporarily override the JWT secret for the tests
    process.env.JWT_SECRET = TEST_SECRET;
  });

  // Before each test has started:
  beforeEach(async () => {
    // Clear previous users to start fresh
    await db.User.destroy({ where: {} });

    // Creates a test user
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    testUser = await db.User.create({
      firstName: 'Jane',
      lastName: 'Doe',
      age: 25,
      email: 'jane@example.com',
      password: hashedPassword,
    });

    // Signs a valid JWT for the test user using the test-only secret
    token = jwt.sign(
      { id: testUser.id, email: testUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  // After the tests are over:
  afterAll(async () => {
    // Reset the JWT secret's original value
    process.env.JWT_SECRET = ORIGINAL_SECRET;
    // Close the connection to the database
    await db.sequelize.close();
  });

  // --- TESTS ------------------------------------------------------

  // ---------------------- SUCCESSFUL UPDATES ----------------------
  describe('Successful updates', () => {
    it('should edit both email and password successfully when valid token is provided', async () => {
      const newEmail = 'john1@example.com';
      const newPassword = 'Password123!';

      const res = await request(app)
        .patch('/auth')
        .set('Cookie', [`auth-token=${token}`])
        .send({ newEmail, newPassword });

      // Fetch updated user from DB
      const updatedUser = await db.User.findByPk(testUser.id);
      const isPasswordUpdated = await bcrypt.compare(newPassword, updatedUser.password);

      expect(updatedUser.email).toBe(newEmail);
      expect(isPasswordUpdated).toBe(true);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('User data updated successfully');
    });

    it('should edit user email successfully when valid token is provided', async () => {
      const newEmail = 'johntravolta@gmail.com';
      const res = await request(app)
        .patch('/auth')
        .set('Cookie', [`auth-token=${token}`])
        .send({ newEmail });

      const updatedUser = await db.User.findByPk(testUser.id);
      const isPasswordUnchanged = await bcrypt.compare('Password123!', updatedUser.password);

      expect(updatedUser.email).toBe(newEmail);
      expect(isPasswordUnchanged).toBe(true);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('User data updated successfully');
    });

    it('should edit user password successfully when valid token is provided', async () => {
      const newPassword = 'NewPassword123!';
      const res = await request(app)
        .patch('/auth')
        .set('Cookie', [`auth-token=${token}`])
        .send({ newPassword });

      const updatedUser = await db.User.findByPk(testUser.id);
      const isPasswordUpdated = await bcrypt.compare(newPassword, updatedUser.password);

      expect(updatedUser.email).toBe(testUser.email);
      expect(isPasswordUpdated).toBe(true);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('User data updated successfully');
    });
  });

  // ---------------------- VALIDATION ERRORS ----------------------
  describe('Validation errors', () => {
    it('should return 400 Bad Request when no email and password are provided', async () => {
      const res = await request(app)
        .patch('/auth')
        .set('Cookie', [`auth-token=${token}`])
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Please provide new email or password');
    });

    it('should return 400 when the new email is invalid', async () => {
      const res = await request(app)
        .patch('/auth')
        .set('Cookie', [`auth-token=${token}`])
        .send({ newEmail: 'notAnEmail' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid email format');
    });

    it('should return 409 Conflict when the new email is already in use', async () => {
      const hashedPassword = await bcrypt.hash('Password123!', 10);
      await db.User.create({
        firstName: 'John',
        lastName: 'Cena',
        age: 25,
        email: 'johncena@example.com',
        password: hashedPassword,
      });

      const res = await request(app)
        .patch('/auth')
        .set('Cookie', [`auth-token=${token}`])
        .send({ newEmail: 'johncena@example.com' });

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Email is already in use.');
    });

    it('should return 400 Bad Request when the new password is too weak', async () => {
      const res = await request(app)
        .patch('/auth')
        .set('Cookie', [`auth-token=${token}`])
        .send({ newPassword: 'weakpass' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.');
    });
  });

  // ---------------------- AUTHENTICATION ERRORS ----------------------
  describe('Authentication errors', () => {
    it('should return 401 Unauthorized when an invalid user token is passed', async () => {
      const res = await request(app)
        .patch('/auth')
        .set('Cookie', [`auth-token=invalidusertoken`])
        .send({ newEmail: 'john3@example.com', newPassword: 'Password123!' });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid or expired token');
    });

    it('should return 401 Unauthorized when token is not being passed', async () => {
      const res = await request(app)
        .patch('/auth')
        .send({ newEmail: 'john3@example.com', newPassword: 'Password123!' });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Unauthorized');
    });
  });

  // ---------------------- SERVER ERRORS ----------------------
  describe('Server errors', () => {
    it('should handle unexpected errors', async () => {
      // Force DB findOne to fail
      jest.spyOn(db.User, 'findOne').mockRejectedValueOnce(new Error('Database connection failed.'));

      const res = await request(app)
        .patch('/auth')
        .set('Cookie', [`auth-token=${token}`])
        .send({ newEmail: 'broken@example.com' });

      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Internal server error');

      // Restore mocks
      jest.restoreAllMocks();
    });
  });
});
