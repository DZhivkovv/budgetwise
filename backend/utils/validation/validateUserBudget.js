/**
 * Validates a user's monthly budget and currency input.
 *
 * --- VALIDATION RULES ---
 * • Budget must be provided.
 * • Budget must be a positive finite number.
 * • Currency must be one of: "BGN", "EUR", "USD".
 *
 * --- RETURN FORMAT ---
 * Always returns an object containing:
 *  - {boolean} valid   → Whether the input is valid.
 *  - {number}  status  → HTTP status code the controller should use.
 *  - {string} [message] → Error message when invalid.
 *
 * @param {number|string} budget - The numeric budget value provided by the user.
 * @param {string} currency - The currency type. Allowed: "BGN", "EUR", "USD".
 *
 * @returns {{ valid: boolean, status: number, message?: string }}
 * An object describing whether the input is valid and what response to send.
 */
export function validateUserBudget(budget, currency) {
  // Check if the budget is not provided.
  if (budget === null || budget === undefined || budget === "") {
    return {
      valid: false,
      status: 400,
      message: "Please enter a valid budget.",
    };
  }

  // Convert the budget to a numeric type for safety purposes.
  const numericBudget = Number(budget);
  // If the budget amount is not a number, is a a number that is less than a zero or is a number that has a value of infinity, the budget is invalid
  if (
    isNaN(numericBudget) ||
    !Number.isFinite(numericBudget) ||
    numericBudget <= 0
  ) {
    return {
      valid: false,
      status: 400,
      message: "Please enter a valid budget.",
    };
  }

  // If the currency is not BGN, EUR or USD, the budget is invalid
  if (!["BGN", "EUR", "USD"].includes(currency)) {
    return {
      valid: false,
      status: 400,
      message: "Please choose a valid currency.",
    };
  }

  return { valid: true, status: 200 };
}
