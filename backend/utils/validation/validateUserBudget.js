/**
 * Validates a user's monthly budget and currency input.
 *
 * --- VALIDATION RULES ---
 * • Budget must be a positive number.
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
export default function validateUserBudget(budget, currency) {
  // If the budget amount is not a number or a number that is less than a zero, the budget is invalid
  if (isNaN(budget) || budget < 0) {
    return { valid: false, status: 400, message: "Invalid budget value" };
  }

  // If the currency is not BGN, EUR or USD, the budget is invalid
  if (!['BGN', 'EUR', 'USD'].includes(currency)) {
    return { valid: false, status: 400, message: "Invalid currency value" };
  }

  return { valid: true, status: 200 };
}
