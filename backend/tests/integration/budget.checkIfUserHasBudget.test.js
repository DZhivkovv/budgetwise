import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../../index.js';
import db from '../../models/index.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

describe('GET /budget (Check if user has budget)', () => {
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
    //Defining a variable that will contain the test user's budget data.
    let userBudget;

    // Before the tests have started:
    beforeAll(async () => {
        // Reset and initialize a fresh test DB
        await db.sequelize.sync({ force: true });

        // Create a test user
        const hashedPassword = await bcrypt.hash('Password123!', 10);
        testUser = await db.User.create({
        firstName: 'Dwayne',
        lastName: 'Johnson',
        age: 25,
        email: 'dwaynejohnson@example.com',
        password: hashedPassword,
        });

        // Use the test-only secret to sign a jwt.
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

        // Add a budget to the test user.
        userBudget = await db.Budget.create({
            userId: testUser.id,
            amount: 2000,
            currency: 'BGN',
        });
    });

    // After the tests are over:
    afterAll(async () => {
        // Reset the jwt secret's original value.
        process.env.JWT_SECRET = ORIGINAL_SECRET;
        // Close the connection to the database.
        await db.sequelize.close();
    });


    // --- TESTS ------------------------------------------------------

    // ---------------------- SUCCESSFUL TESTS ----------------------
    describe('Successful budget check', () => {

        it('should return hasBudget: true when user has a budget', async () => {
            const res = await request(app)
            .get('/budget')
            .set('Cookie', [`auth-token=${token}`])

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('Budget status retrieved successfully.');
            expect(res.body.data.hasBudget).toBe(true);
            expect(res.body.data.budget).toBe(userBudget.amount);
            expect(res.body.data.currency).toBe(userBudget.currency);

        });

        it('should return hasBudget: false when user has no budget', async () => {
            await userBudget.destroy(); // премахва съществуващия

            const res = await request(app)
                .get('/budget')
                .set('Cookie', [`auth-token=${token}`]);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('Budget status retrieved successfully.');
            expect(res.body.data.hasBudget).toBe(false);
            expect(res.body.data.budget).toBe(null);
            expect(res.body.data.currency).toBe(null);
        });

    });

    // ---------------------- AUTHENTICATION ERRORS ----------------------
    describe('Authentication errors', () => {

        it('should return 401 Unauthorized when token is missing', async () => {
            const res = await request(app).get('/budget');

            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Unauthorized');
        });

        it('should return 401 Unauthorized when token is invalid', async () => {
            const res = await request(app)
            .get('/budget')
            .set('Cookie', [`auth-token=invalidtoken`])

            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Invalid or expired token');
        });

        it('should return 401 Unauthorized when token is expired', async () => {
            const res = await request(app)
            .get('/budget')
            .set('Cookie', [`auth-token=${expiredToken}`])

            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Invalid or expired token');
        });        
    });

    // ---------------------- SERVER ERRORS ----------------------
    describe('Server errors', () => {
        it('should handle unexpected errors', async () => {
            jest.spyOn(db.Budget, 'findOne').mockRejectedValueOnce(
                new Error('Database connection failed.')
            );

            const res = await request(app)
            .get('/budget')
            .set('Cookie', [`auth-token=${token}`]);

            expect(res.statusCode).toBe(500);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Internal server error.');

            jest.restoreAllMocks();
        });
    });
});
