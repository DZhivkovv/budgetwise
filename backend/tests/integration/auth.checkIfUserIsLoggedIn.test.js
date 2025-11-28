import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../../index.js';
import db from '../../models/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

describe('GET /auth (Check if user is logged in)', () => {
  let token;
  // Preserves original secret.
  const ORIGINAL_SECRET = process.env.JWT_SECRET;
  // Defines test-only secret.
  const TEST_SECRET = 'test_secret';

  let testUser;

  const createToken = (payload, options = {}) => {
    return jwt.sign(payload, TEST_SECRET, { expiresIn: '1h', ...options });
  };
  
  // Before the tests have started:
  beforeAll(async () => {
    // Reset and initialize a fresh DB
    await db.sequelize.sync({ force: true });
    // Use the test-only secret.
    process.env.JWT_SECRET = TEST_SECRET;

    // Create new user
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    testUser = await db.User.create({
      firstName: 'Steve',
      lastName: 'Austin',
      age: 25,
      email: 'steveaustin@example.com',
      password: hashedPassword,
    });

    // Create a valid JWT.
    token = createToken({ id: testUser.id, email: testUser.email });
  });

  // After the tests are over:
  afterAll(async () => {
    // Reset the jwt secret's original value.
    process.env.JWT_SECRET = ORIGINAL_SECRET;
    // Close the connection to the database.
    await db.sequelize.close();
  });

  // --- TESTS ------------------------------------------------------

  it('should authenticate the user when a valid token is provided', async () => {
    const res = await request(app)
      .get('/auth')
      .set('Cookie', [`auth-token=${token}`]);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('User is authenticated');
  });

  it('should return 401 Unauthorized if no token is provided', async () => {
    const res = await request(app).get('/auth');

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Unauthorized');
  });

  it('should return 401 Unauthorized if the token is invalid', async () => {
    const res = await request(app)
      .get('/auth')
      .set('Cookie', ['auth-token=invalidtoken']);

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid or expired token');
  });

  it('should return 401 Unauthorized if the token is expired', async () => {
    const expiredToken = createToken(
      { id: testUser.id, email: testUser.email },
      { expiresIn: '-1s' }
    );

    const res = await request(app)
      .get('/auth')
      .set('Cookie', [`auth-token=${expiredToken}`]);

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid or expired token');
  });

  it('should handle unexpected server errors', async () => {
    jest.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new Error('Unexpected error');
    });

    const res = await request(app)
      .get('/auth')
      .set('Cookie', [`auth-token=${token}`]);

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Internal server error');

    jest.restoreAllMocks();
  });

});
