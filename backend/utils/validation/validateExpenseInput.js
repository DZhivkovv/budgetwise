/**
 * Validates user input for an expense.
 *
 * @param {number} expenseCategoryId - The ID of the expense category (must be a positive integer).
 * @param {number} expenseAmount - Expense amount (must be positive).
 * @param {string} expenseDate - Date string in YYYY-MM-DD format.
 *
 * @returns {{ valid: boolean, status: number, message: string }}
 *   An object indicating validation result and appropriate HTTP status/message.
 */
export default function validateExpenseInput(
  expenseCategoryId,
  expenseAmount,
  expenseDate,
) {
  // Validate category ID
  if (
    expenseCategoryId === undefined ||
    expenseCategoryId === null ||
    typeof expenseCategoryId !== "number" ||
    !Number.isInteger(expenseCategoryId) ||
    expenseCategoryId <= 0
  ) {
    return { valid: false, status: 400, message: "Please select a category." };
  }

  // Validate expense amount
  if (
    expenseAmount === undefined ||
    expenseAmount === null ||
    typeof expenseAmount !== "number" ||
    isNaN(expenseAmount) ||
    expenseAmount <= 0
  ) {
    return {
      valid: false,
      status: 400,
      message: "Please enter an expense amount.",
    };
  }

  // Validate expense date (must be parsable as a valid date)
  if (
    typeof expenseDate !== "string" ||
    expenseDate.trim() === "" ||
    isNaN(new Date(expenseDate).getTime())
  ) {
    return {
      valid: false,
      status: 400,
      message: "Please select an expense date.",
    };
  }

  // Everything is valid
  return { valid: true, status: 200, message: "Expense details are valid." };
}
