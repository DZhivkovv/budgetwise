import { getBudgetEndDate } from '../../../utils/budget/getBudgetEndDate.js';

describe('getBudgetEndDate', () => {
  // ✅ NORMAL CASE
  test('should add one month for a normal mid-month date', () => {
    const startDate = new Date('2024-01-15');
    const result = getBudgetEndDate(startDate);

    expect(result.toISOString().split('T')[0]).toBe('2024-02-15');
  });

  // ✅ MONTH-END ROLLOVER (31st → Feb)
  test('should handle month-end rollover for January 31', () => {
    const startDate = new Date('2024-01-31');
    const result = getBudgetEndDate(startDate);

    // 2024 is leap year → Feb has 29 days
    expect(result.toISOString().split('T')[0]).toBe('2024-02-29');
  });

  // ✅ NON-LEAP YEAR FEBRUARY
  test('should handle non-leap year February correctly', () => {
    const startDate = new Date('2023-01-31');
    const result = getBudgetEndDate(startDate);

    expect(result.toISOString().split('T')[0]).toBe('2023-02-28');
  });

  // ✅ 30-DAY MONTH
  test('should correctly roll over from March 31 to April 30', () => {
    const startDate = new Date(2024, 2, 31); // months are 0-based
    const result = getBudgetEndDate(startDate);

    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(3); // April
    expect(result.getDate()).toBe(30);
  });

  // ✅ SAME DAY WHEN POSSIBLE
  test('should keep same day if next month supports it', () => {
    const startDate = new Date('2024-05-10');
    const result = getBudgetEndDate(startDate);

    expect(result.toISOString().split('T')[0]).toBe('2024-06-10');
  });

  // ✅ DATE OBJECT IMMUTABILITY
  test('should not mutate the original date object', () => {
    const startDate = new Date('2024-01-20');
    const originalCopy = new Date(startDate);

    getBudgetEndDate(startDate);

    expect(startDate.getTime()).toBe(originalCopy.getTime());
  });
});