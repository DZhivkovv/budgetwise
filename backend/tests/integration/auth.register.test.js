import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../../index.js';
import db from '../../models/index.js';

describe('POST /auth/register', () => {
    // Before the tests have started:
    beforeAll(async () => {
        // Reset and initialize a fresh test DB
        await db.sequelize.sync({ force: true });
    });

   // After the tests are over:
   afterAll(async () => {
        // Close the connection to the database.
        await db.sequelize.close();
    });

    
    // --- TESTS ------------------------------------------------------

    // ---------------------- SUCCESSFUL TESTS ----------------------
    describe('Successful registration', () => {
        it('should successfully register a new user when valid data is provided', async () => {
            const res = await request(app)
                .post('/auth/register')
                .send({
                    firstName: 'John',
                    lastName: 'Doe',
                    age: 25,
                    email: 'john@example.com',
                    password: 'Password123!',
                    confirmPassword: 'Password123!'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('Registration successful');
        });
    });

    // ---------------------- VALIDATION ERRORS ----------------------
    describe('Validation errors', () => {

        // Wrong datatype
        it('should return 400 Bad Request when invalid registration data is provided', async () => {
            const res = await request(app)
                .post('/auth/register')
                .send({
                    firstName: 'John',
                    lastName: 'Doe',
                    age: 'not an age',
                    email: 'john@example.com',
                    password: 'Password123!',
                    confirmPassword: 'Password123!'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Wrong field datatype!');
        });

        // Missing field
        it('should return 400 Bad Request when piece of registration data is missing', async () => {
            const res = await request(app)
                .post('/auth/register')
                .send({
                    firstName: 'John',
                    lastName: 'Doe',
                    age: '',
                    email: 'john@example.com',
                    password: 'Password123!',
                    confirmPassword: 'Password123!'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('All fields are required!');
        });

        // Age-related tests
        it('should return 400 Bad Request when the user age is not a whole integer', async () => {
            const res = await request(app)
                .post('/auth/register')
                .send({
                    firstName: 'John',
                    lastName: 'Doe',
                    age: '20.5',
                    email: 'john@example.com',
                    password: 'Password123!',
                    confirmPassword: 'Password123!'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Your age must be a whole number between 13 and 120!');
        });

        it('should return 400 Bad Request when the user age is less than 13 years', async () => {
            const res = await request(app)
                .post('/auth/register')
                .send({
                    firstName: 'John',
                    lastName: 'Doe',
                    age: '10',
                    email: 'john@example.com',
                    password: 'Password123!',
                    confirmPassword: 'Password123!'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Your age must be a whole number between 13 and 120!');
        });

        it('should return 400 Bad Request when the user age is more than 120 years', async () => {
            const res = await request(app)
                .post('/auth/register')
                .send({
                    firstName: 'John',
                    lastName: 'Doe',
                    age: '121',
                    email: 'john@example.com',
                    password: 'Password123!',
                    confirmPassword: 'Password123!'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Your age must be a whole number between 13 and 120!');
        });

        it('should return 400 Bad Request when age is a number but outside the safe integer range', async () => {
            const res = await request(app)
                .post('/auth/register')
                .send({
                    firstName: 'John',
                    lastName: 'Doe',
                    age: 9007199254740993,
                    email: 'john@example.com',
                    password: 'Password123!',
                    confirmPassword: 'Password123!'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Your age must be a whole number between 13 and 120!');
        });

        // Whitespace names
        it('should return 400 Bad Request when firstName contains only whitespace', async () => {
            const res = await request(app)
                .post('/auth/register')
                .send({
                    firstName: '   ',
                    lastName: 'Doe',
                    age: 25,
                    email: 'john@example.com',
                    password: 'Password123!',
                    confirmPassword: 'Password123!'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('All fields are required!');
        });

        it('should return 400 Bad Request when lastName contains only whitespace', async () => {
            const res = await request(app)
                .post('/auth/register')
                .send({
                    firstName: 'John',
                    lastName: '   ',
                    age: 25,
                    email: 'john@example.com',
                    password: 'Password123!',
                    confirmPassword: 'Password123!'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('All fields are required!');
        });

        // Invalid email formatting
        it('should return 400 Bad Request when the email field contains an empty string after trimming', async () => {
            const res = await request(app)
                .post('/auth/register')
                .send({
                    firstName: 'John',
                    lastName: 'Doe',
                    age: 25,
                    email: '   ',
                    password: 'Password123!',
                    confirmPassword: 'Password123!'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('All fields are required!');
        });

        it('should return 400 Bad Request when the email format is invalid', async () => {
            const res = await request(app)
                .post('/auth/register')
                .send({
                    firstName: 'John',
                    lastName: 'Doe',
                    age: 25,
                    email: 'not-an-email',
                    password: 'Password123!',
                    confirmPassword: 'Password123!'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Invalid email address.');
        });

        it('should return 400 Bad Request when an email that already is in use by another user is provided', async () => {
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                age: 20,
                email: 'john@example.com',
                password: 'Password123!',
                confirmPassword: 'Password123!'
            }

            await request(app).post('/auth/register').send(userData);

            const res = await request(app)
                .post('/auth/register')
                .send(userData)
                .expect(400);

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Email already exists. Please use a different one.');
        });

        // Password strength tests
        it('should return 400 Bad Request when password lacks a required character type (missing uppercase)', async () => {
            const res = await request(app)
                .post('/auth/register')
                .send({
                    firstName: 'John',
                    lastName: 'Doe',
                    age: 25,
                    email: 'john@example.com',
                    password: 'password123!',
                    confirmPassword: 'password123!'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Password must be at least 8 chars and include uppercase, lowercase, number, and special character.');
        });

        it('should return 400 Bad Request when password lacks number', async () => {
            const res = await request(app)
                .post('/auth/register')
                .send({
                    firstName: 'John',
                    lastName: 'Doe',
                    age: 25,
                    email: 'john@example.com',
                    password: 'Password!!!',
                    confirmPassword: 'Password!!!'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Password must be at least 8 chars and include uppercase, lowercase, number, and special character.');
        });

        it('should return 400 Bad Request when password lacks special character', async () => {
            const res = await request(app)
                .post('/auth/register')
                .send({
                    firstName: 'John',
                    lastName: 'Doe',
                    age: 25,
                    email: 'john@example.com',
                    password: 'Password123',
                    confirmPassword: 'Password123'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Password must be at least 8 chars and include uppercase, lowercase, number, and special character.');
        });

        it('should return 400 Bad Request when password is too weak', async () => {
            const res = await request(app)
                .post('/auth/register')
                .send({
                    firstName: 'Jane',
                    lastName: 'Smith',
                    age: 22,
                    email: 'jane@example.com',
                    password: 'Pass',
                    confirmPassword: 'Pass'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Password must be at least 8 chars and include uppercase, lowercase, number, and special character.');
        });

        // Password mismatch
        it('should return 400 Bad Request when password and confirmPassword field values do not match', async () => {
            const res = await request(app)
                .post('/auth/register')
                .send({
                    firstName: 'Jane',
                    lastName: 'Smith',
                    age: 22,
                    email: 'jane@example.com',
                    password: 'Password123!',
                    confirmPassword: 'DifferentPassword!'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Passwords do not match.');
        });
    });

    // ---------------------- SERVER ERRORS ----------------------
    describe('Server errors', () => {
        it('should handle unexpected errors', async () => {
            jest.spyOn(db.User, 'create').mockRejectedValueOnce(new Error('Database connection failed.'));

            const res = await request(app)
                .post('/auth/register')
                .send({
                    firstName: 'Jane',
                    lastName: 'Smith',
                    age: 22,
                    email: 'jane@example.com',
                    password: 'Password123!',
                    confirmPassword: 'Password123!'
                });

            expect(res.statusCode).toBe(500);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Internal server error');

            jest.restoreAllMocks();
        });
    });
});
