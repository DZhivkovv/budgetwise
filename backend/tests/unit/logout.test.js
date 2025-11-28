import { logout } from "../../controllers/auth";
import { jest } from '@jest/globals';

describe('logout controller', () => {
  it('should logout user successfully', async () => {
    const req = {};
    const res = {
      clearCookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await logout(req, res);

    expect(res.clearCookie).toHaveBeenCalledWith("auth-token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Logged out successfully",
    });
  });

  it('should handle internal server error gracefully', async () => {
    const req = {};
    const res = {
      clearCookie: jest.fn(() => { throw new Error('Unexpected failure'); }),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await logout(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal server error",
    });
  });
});
