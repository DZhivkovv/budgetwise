import { afterAll, jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import getUserIdFromToken from '../../utils/auth/getUserIdFromToken';

describe('getUserIdFromToken', () => {
  // Preserves original secret.
  const ORIGINAL_SECRET = process.env.JWT_SECRET;
  // Defines test-only secret.
  const TEST_SECRET = 'test_secret';
  
  // Before the tests have started:
  beforeAll(async () => {
    // Use the test-only secret for the tests.
    process.env.JWT_SECRET = TEST_SECRET;
  });

  // After the tests have ended:
  afterAll(()=>{
    // Restore the original JWT Secret's original value.
    process.env.JWT_SECRET = ORIGINAL_SECRET;
  })

  // ---------------- SUCCESS TESTS ---------------------
  describe('Successful tests', () => {

    it('should return userId successfully when the provided token is valid', () => {
      // Create a fake jwt token with a fake secret
      const fakeUser = { id: 123 };
      const token = jwt.sign(fakeUser, process.env.JWT_SECRET);
      // Mock cookies
      const cookies = { 'auth-token': token };

      const result = getUserIdFromToken(cookies, 'auth-token');

      expect(result.success).toBe(true);
      expect(result.status).toBe(200);
      expect(result.message).toBe('User ID found');      
      expect(result.userId).toBe(123);
    });
  });
  
  // ---------------- VALIDATION ERRORS ------------------
  describe('Validation errors', () => {
    it('should return reject when no cookies are provided', () => {
      const result = getUserIdFromToken({}, 'auth-token');

      expect(result.success).toBe(false);
      expect(result.status).toBe(401);
      expect(result.message).toBe('Unauthorized');      
    });

    it('should reject when no token is provided', () => {
      const cookies = { 'auth-token': 'invalid token' };
      const result = getUserIdFromToken(cookies, 'auth-token');

      expect(result.success).toBe(false);
      expect(result.status).toBe(401);
      expect(result.message).toBe('Invalid or expired token');      
    });
    
    it('should reject when token does not contain userId', () => {
      const token = jwt.sign({}, process.env.JWT_SECRET);
      const cookies = { 'auth-token': token };
      const result = getUserIdFromToken(cookies, 'auth-token');

      expect(result.success).toBe(false);
      expect(result.status).toBe(404);
      expect(result.message).toBe('User ID not found in the token');
    });    

    it('should reject when the token is expired', () => {
      const token = jwt.sign({ id: 123 }, process.env.JWT_SECRET, { expiresIn: '-1h' });
      const cookies = { 'auth-token': token };
      const result = getUserIdFromToken(cookies, 'auth-token');


      expect(result.success).toBe(false);
      expect(result.status).toBe(401);
      expect(result.message).toBe('Invalid or expired token');
   });

  });

 // ---------------- SERVER ERRORS ----------------
  describe('Server errors', () => {
    it('should return 500 for unexpected error', () => {
      jest.spyOn(jwt, 'verify').mockImplementation(() => { throw new Error('Unexpected'); });
      
      const cookies = { 'auth-token': 'dummy' };
      const result = getUserIdFromToken(cookies, 'auth-token');

      expect(result.success).toBe(false);
      expect(result.status).toBe(500);
      expect(result.message).toBe('Unexpected');
      
      jest.restoreAllMocks();
    });
  });

});


