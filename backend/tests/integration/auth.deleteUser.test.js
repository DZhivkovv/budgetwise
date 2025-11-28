import { beforeAll, jest } from '@jest/globals';
import request from 'supertest';
import app from '../../index.js';
import db from '../../models/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

describe('DELETE /auth (Delete user Data)', () => {
  // Preserves original secret and defines test-only secret
  const ORIGINAL_SECRET = process.env.JWT_SECRET;
  const TEST_SECRET = 'test_secret';

  // Defines a variables that will contain json web token and test user data
  let token;
  let testUser;

  // Before the tests have started:
  beforeAll(async () => {
    // Temporarily override the JWT secret for the tests.
    process.env.JWT_SECRET = TEST_SECRET;
  })
  
  // Before each test has started:
  beforeEach(async () => {
    // Reset and initialize a fresh test DB
    await db.sequelize.sync({ force: true });
    // Create a test user to delete
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    testUser = await db.User.create({
      firstName: 'Dave',
      lastName: 'Batista',
      age: 25,
      email: 'davebatista@example.com',
      password: hashedPassword,
    });

    // Signs a valid jwt for the test user using the test-only secred.
    token = jwt.sign(
      { id: testUser.id, email: testUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
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

  it('should delete user data when a valid token is provided', async () => {
    const res = await request(app)
      .delete('/auth')
      .set('Cookie', [`auth-token=${token}`])

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('User account deleted successfully');
  });

  it('should return 401 Unauthorized when user is not authenticated', async () => {
    const res = await request(app)
      .delete('/auth')

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Unauthorized');
  });

  it('should return 401 Unauthorized when the provided token is invalid', async () => {
    const res = await request(app)
      .delete('/auth')
      .set('Cookie', [`auth-token=invalid`])

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid or expired token');
  });    

  it('should return 401 Unauthorized when the provided token is expired', async () => {
    // Creates a token that expired 1 second ago
    const expiredToken = jwt.sign(
      { id: testUser.id, email: testUser.email },
      TEST_SECRET,
      { expiresIn: '-1s' }
    );

    const res = await request(app)
      .delete('/auth')
      .set('Cookie', [`auth-token=${expiredToken}`]);

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid or expired token');
  });

  it("should return 404 when the user does not exist", async () => {
    await db.User.destroy({where: {id: testUser.id}});

    const res = await request(app)
        .delete("/auth")
        .set("Cookie", [`auth-token=${token}`]);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("User not found");
  });


  it('should handle unexpected errors', async () => {
    jest.spyOn(db.User, 'findByPk').mockRejectedValueOnce(
      new Error('Database connection failed.')
    );

    const res = await request(app)
      .delete('/auth')
      .set('Cookie', [`auth-token=${token}`]);

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Internal server error');

    jest.restoreAllMocks();
  });

});
