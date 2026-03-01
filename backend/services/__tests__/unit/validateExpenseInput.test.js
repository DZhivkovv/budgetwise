import validateExpenseInput from "../../../utils/validation/validateExpenseInput.js";

describe("validateExpenseInput", () => {

  const validData = {
    expenseCategoryId: 1,
    expenseAmount: 100,
    expenseDate: "2026-02-08",
    expenseIsPeriodic: false,
    recurringPeriod: null
  };

  it("returns valid=true for correct one-time expense data", () => {
    const result = validateExpenseInput(
      validData.expenseCategoryId,
      validData.expenseAmount,
      validData.expenseDate,
      validData.expenseIsPeriodic,
      validData.recurringPeriod
    );

    expect(result.valid).toBe(true);
    expect(result.status).toBe(200);
  });

  it("returns valid=true for correct periodic expense data", () => {
    const result = validateExpenseInput(1, 50, "2026-02-08", true, "monthly");
    expect(result.valid).toBe(true);
    expect(result.status).toBe(200);
  });

  // ❌ Failure cases for categoryId
  it.each([null, undefined, -1, 0, 1.5, "abc"])(
    "returns 400 if expenseCategoryId is invalid: %p",
    (invalidCategory) => {
      const result = validateExpenseInput(
        invalidCategory,
        100,
        "2026-02-08",
        false,
        null
      );
      expect(result.valid).toBe(false);
      expect(result.status).toBe(400);
      expect(result.message).toMatch(/category/);
    }
  );

  // ❌ Failure cases for expenseAmount
  it.each([null, undefined, 0, -5, "abc", NaN])(
    "returns 400 if expenseAmount is invalid: %p",
    (invalidAmount) => {
      const result = validateExpenseInput(1, invalidAmount, "2026-02-08", false, null);
      expect(result.valid).toBe(false);
      expect(result.status).toBe(400);
      expect(result.message).toMatch(/amount/);
    }
  );

  // ❌ Failure cases for expenseDate
  it.each([null, undefined, "", "not-a-date", "2026-13-01"])(
    "returns 400 if expenseDate is invalid: %p",
    (invalidDate) => {
      const result = validateExpenseInput(1, 100, invalidDate, false, null);
      expect(result.valid).toBe(false);
      expect(result.status).toBe(400);
      expect(result.message).toMatch(/date/);
    }
  );

  // ❌ Failure cases for expenseIsPeriodic
  it.each([null, undefined, "yes", 1])(
    "returns 400 if expenseIsPeriodic is not boolean: %p",
    (invalidPeriodic) => {
      const result = validateExpenseInput(1, 100, "2026-02-08", invalidPeriodic, null);
      expect(result.valid).toBe(false);
      expect(result.status).toBe(400);
      expect(result.message).toMatch(/recurring expense/);
    }
  );

  // ❌ Failure cases for recurringPeriod
  it.each([null, undefined, "daily", ""])(
    "returns 400 if recurringPeriod is invalid when expenseIsPeriodic=true: %p",
    (invalidPeriod) => {
      const result = validateExpenseInput(1, 100, "2026-02-08", true, invalidPeriod);
      expect(result.valid).toBe(false);
      expect(result.status).toBe(400);
      expect(result.message).toMatch(/recurring period/);
    }
  );

  it("returns 400 if recurringPeriod is set but expenseIsPeriodic=false", () => {
    const result = validateExpenseInput(1, 100, "2026-02-08", false, "monthly");
    expect(result.valid).toBe(false);
    expect(result.status).toBe(400);
    expect(result.message).toMatch(/not required/);
  });
});