import bcrypt from 'bcrypt';
import UserModel from "../../../models/user.model";
import { sequelize } from '../../../db/testDb';
import { Sequelize } from 'sequelize';

const User = UserModel(sequelize, Sequelize);

/**
 * Creates a test user in the database with hashed password.
 *
 * This function is used in integration tests to provide a user
 * for authentication or other user-related tests. It returns the
 * created user object along with the plain password for testing.
 *
 * @param {Object} overrides - Optional fields to override the default user data.
 * @param {string} [overrides.firstName] - User's first name.
 * @param {string} [overrides.lastName] - User's last name.
 * @param {number} [overrides.age] - User's age.
 * @param {string} [overrides.email] - User's email.
 * @param {string} [overrides.password] - User's plain-text password.
 * @returns {Promise<Object>} The created user object with an additional `plainPassword` field.
 *
 * @example
 * const { id, email, plainPassword } = await createTestUser({ email: "test@example.com" });
 * // Use plainPassword in authentication tests
 */
export async function createTestUser(overrides = {}) {
    // Test user data.
    const payload = {
        firstName: "John",
        lastName: "Doe",
        age: 25,
        email: "john@example.com",
        password: "Password123!",
        ...overrides
    };

    // Hashing the user password before creating the test user record.
    const hashedPassword = await bcrypt.hash(payload.password, 10);

    // Creating the test user record.
    const user = await User.create({
        ...payload,
        password: hashedPassword
    });

    // Return the test record (in JSON format) alongside the plain user password.
    return { ...user.toJSON(), plainPassword: payload.password };
}

/**
 * Removes all users from the test database.
 *
 * This function is typically called in `afterEach` hooks to ensure
 * each test runs with a clean database state.
 *
 * @returns {Promise<void>}
 *
 * @example
 * await clearUsers();
 */
export async function clearUsers() {
    // Removes all users from the test database.
    await User.destroy({ where: {}, truncate: true, cascade: true });
}