import { validateUserBudget } from '../../../utils/validation/validateUserBudget';

describe('validateUserBudget', () => {

    test('should return valid true for correct budget and currency', () => {
    const result = validateUserBudget(1000, 'EUR');

    expect(result).toEqual({
      valid: true,
      status: 200,
    });
  });

  test.each([
    [null],
    [undefined],
    [''],
  ])('should fail if budget is missing (%p)', (budget) => {
    const result = validateUserBudget(budget, 'BGN');

    expect(result).toEqual({
      valid: false,
      status: 400,
      message: 'Please enter a valid budget.',
    });
  });

  // ❌ INVALID BUDGET VALUES
  test.each([
    ['abc'],       // NaN
    [-100],        // negative
    [0],           // zero
    [Infinity],    // infinity
    [-Infinity],   // negative infinity
  ])('should fail if budget is invalid (%p)', (budget) => {
    const result = validateUserBudget(budget, 'USD');

    expect(result).toEqual({
      valid: false,
      status: 400,
      message: 'Please enter a valid budget.',
    });
  });

  // ❌ INVALID CURRENCY
  test.each([
    [''],
    ['GBP'],
    ['JPY'],
    [null],
    [undefined],
  ])('should fail if currency is invalid (%p)', (currency) => {
    const result = validateUserBudget(500, currency);

    expect(result).toEqual({
      valid: false,
      status: 400,
      message: 'Please choose a valid currency.',
    });
  });

  // ✅ VALID STRING BUDGET (edge case)
  test('should accept numeric budget passed as string', () => {
    const result = validateUserBudget('750', 'BGN');

    expect(result).toEqual({
      valid: true,
      status: 200,
    });
  });
});