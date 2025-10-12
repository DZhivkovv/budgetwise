export default function validateUserBudget(budget, currency) {
  if (isNaN(budget) || budget <= 0) {
    return { valid: false, status: 400, message: "Invalid budget value" };
  }

  if (!['BGN', 'EUR', 'USD'].includes(currency)) {
    return { valid: false, status: 400, message: "Invalid currency value" };
  }

  return { valid: true, status: 200 };
 }
