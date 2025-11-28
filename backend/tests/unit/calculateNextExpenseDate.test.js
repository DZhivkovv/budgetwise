import calculateNextExpenseDate from '../../utils/expense/calculateNextExpenseDate.js'

describe('calculateNextExpenseDate', () => {
    // Basic provided tests
    it('should accept valid expense date and weekly recurring period', () => {
        const result = calculateNextExpenseDate('2025-11-03', 'weekly');
        expect(result).toBe('2025-11-10');
    });

    it('should accept valid expense date and monthly recurring period', () => {
        const result = calculateNextExpenseDate('2025-11-03', 'monthly');
        expect(result).toBe('2025-12-03');
    });

    it('should accept valid expense date and yearly recurring period', () => {
        const result = calculateNextExpenseDate('2025-11-03', 'yearly');
        expect(result).toBe('2026-11-03');
    });

    it('should throw an error for missing expense date', () => {
        expect(() => calculateNextExpenseDate('', 'weekly'))
        .toThrow('Invalid or missing expense date');
    });

    it('should throw an error for invalid expense date', () => {
        expect(() => calculateNextExpenseDate('not a date', 'weekly'))
        .toThrow('Invalid or missing expense date');
    });

    it('should throw an error for invalid recurring period', () => {
        expect(() => calculateNextExpenseDate('2025-11-03', 'daily'))
        .toThrow('Invalid recurring period');
    });

    it('should correctly handle month-end overflow (2025-01-31 + 1 month)', () => {
        const result = calculateNextExpenseDate('2025-01-31', 'monthly');
        expect(result).toBe('2025-03-03'); // JS auto-adjusts
    });

    it('should correctly handle leap year when adding a year', () => {
        const result = calculateNextExpenseDate('2024-02-29', 'yearly');
        expect(result).toBe('2025-02-28');
    });

    it('should correctly handle adding a week across months', () => {
        const result = calculateNextExpenseDate('2025-11-28', 'weekly');
        expect(result).toBe('2025-12-05');
    });

    it('should correctly handle monthly wrapping (date doesn’t exist next month)', () => {
        const result = calculateNextExpenseDate('2025-03-31', 'monthly');
        // March 31 → April 31 does not exist → JS shifts to May 1
        expect(result).toBe('2025-05-01');
    });
});
