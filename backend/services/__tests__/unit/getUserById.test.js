import { jest } from "@jest/globals";
import { getUserById } from '../../../services/authService.js';
import db from '../../../models/index.js';
const User = db.User;

// Mock the User model
jest.mock('../../../models/index.js', () => ({
  User: {
    findByPk: jest.fn(),
  },
}));

describe('getUserById', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should throw 400 if userId is invalid', async () => {
    await expect(getUserById()).rejects.toMatchObject({
      message: 'Invalid user ID',
      status: 400,
    });

    await expect(getUserById('1')).rejects.toMatchObject({
      message: 'Invalid user ID',
      status: 400,
    });
  });

  test('should throw 404 if user does not exist', async () => {
    User.findByPk.mockResolvedValue(null);

    await expect(getUserById(999)).rejects.toMatchObject({
      message: 'User not found',
      status: 404,
    });

    expect(User.findByPk).toHaveBeenCalledWith(999, {
      attributes: { exclude: ['password'] },
    });
  });

  test('should return user data when user exists', async () => {
    const mockUser = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    };

    User.findByPk.mockResolvedValue(mockUser);

    const result = await getUserById(1);

    expect(result).toEqual(mockUser);
    expect(User.findByPk).toHaveBeenCalledTimes(1);
    expect(User.findByPk).toHaveBeenCalledWith(1, {
      attributes: { exclude: ['password'] },
    });
  });

  test('should throw if database throws unexpected error', async () => {
    User.findByPk.mockRejectedValue(new Error('DB failure'));

    await expect(getUserById(1)).rejects.toThrow('DB failure');
  });
});