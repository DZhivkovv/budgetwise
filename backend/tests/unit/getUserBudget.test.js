import { jest } from '@jest/globals';

jest.unstable_mockModule('../../models/index.js', () => ({
  default: {
    Budget: {
      findOne: jest.fn(),
    },
  },
}));

const { default: getUserBudget } = await import('../../utils/budget/getUserBudget.js');
const { default: db } = await import('../../models/index.js');


describe('getUserBudget', () => {
  
  // ---------------- SUCCESSFUL TESTS ---------------------
  describe('Successful tests', () => {

    it('should return a budget successfully if found', async () => {
      db.Budget.findOne.mockResolvedValue({ userId: 1, amount: 1000 });
      const result = await getUserBudget(1);

      expect(result.success).toBe(true);
      expect(result.status).toBe(200);
      expect(result.message).toBe('User budget retrieved successfully!');
      expect(result.data).toEqual({ userId: 1, amount: 1000 });
    });

    it('should return an empty object when the user does not have a budget', async () => {
      db.Budget.findOne.mockResolvedValue(null);
      const result = await getUserBudget(1);

      expect(result.success).toBe(false);
      expect(result.status).toBe(404);
      expect(result.message).toBe('No budget found.');
      expect(result.data).toEqual({});
    });
  });

  // ---------------------- VALIDATION ERRORS ----------------------
  describe('Validation errors', () => {

    it('should reject when the user ID is undefined', async () => {
      const result = await getUserBudget(undefined);

      expect(result.success).toBe(false);
      expect(result.status).toBe(400);
      expect(result.message).toBe('Invalid or missing user ID.');
      expect(result.data).toEqual({});
    });   
    
    it('should reject when the user ID is a string', async () => {
      const result = await getUserBudget('not a valid user ID');

      expect(result.success).toBe(false);
      expect(result.status).toBe(400);
      expect(result.message).toBe('Invalid or missing user ID.');
      expect(result.data).toEqual({});
    });

    it('should reject when the user ID is negative number', async () => {
      const result = await getUserBudget(-10);

      expect(result.success).toBe(false);
      expect(result.status).toBe(400);
      expect(result.message).toBe('Invalid or missing user ID.');
      expect(result.data).toEqual({});
    });

     it('should reject when the user ID is zero', async () => {
      const result = await getUserBudget(0);

      expect(result.success).toBe(false);
      expect(result.status).toBe(400);
      expect(result.message).toBe('Invalid or missing user ID.');
      expect(result.data).toEqual({});
    });

     it('should reject when the user ID is null', async () => {
      const result = await getUserBudget(null);

      expect(result.success).toBe(false);
      expect(result.status).toBe(400);
      expect(result.message).toBe('Invalid or missing user ID.');
      expect(result.data).toEqual({});
    });
    
    it('should reject when the user ID is NaN', async () => {
      const result = await getUserBudget(NaN);

      expect(result.success).toBe(false);
      expect(result.status).toBe(400);
      expect(result.message).toBe('Invalid or missing user ID.');
      expect(result.data).toEqual({});
    });    
  });

  // ---------------------- SERVER ERRORS ----------------------
  describe('Server errors', () => {

    it('should handle database errors', async () => {
      jest.spyOn(db.Budget, 'findOne').mockRejectedValueOnce(
          new Error('Database connection failed.')
      );

      const result = await getUserBudget(1);
      
      expect(result.success).toBe(false);
      expect(result.status).toBe(500);
      expect(result.message).toBe('Database connection failed.');
      expect(result.data).toEqual({});

      db.Budget.findOne.mockRestore();
    });

  });
});
