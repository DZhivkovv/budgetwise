/**
 * Validates user input for an expense.
 *
 * @param {number} expenseCategoryId - The ID of the expense category (must be a positive integer).
 * @param {number} expenseAmount - Expense amount (must be positive).
 * @param {string} expenseDate - Date string in YYYY-MM-DD format.
 * @param {boolean} expenseIsPeriodic - Whether the expense is recurring.
 * @param {string|null} recurringPeriod - Required if periodic; must be 'weekly', 'monthly', or 'yearly'.
 * 
 * @returns {{ valid: boolean, status: number, message: string }}
 *   An object indicating validation result and appropriate HTTP status/message.
 */
export default function validateExpenseInput(expenseCategoryId, expenseAmount, expenseDate, expenseIsPeriodic, recurringPeriod) 
{

    // Validate category ID
   if (
        expenseCategoryId === undefined ||
        expenseCategoryId === null ||
        typeof expenseCategoryId !== "number" ||
        !Number.isInteger(expenseCategoryId) ||
        expenseCategoryId <= 0
    )
    {
        return { valid: false, status: 400,  message: "Invalid expense category ID." };
    }

    // Validate expense amount
    if (
        expenseAmount === undefined ||
        expenseAmount === null ||
        typeof expenseAmount !== "number" ||
        isNaN(expenseAmount) ||
        expenseAmount <= 0
    )
    {
        return { valid: false, status: 400,  message: "Invalid expense amount" };
    }

    // Validate expense date (must be parsable as a valid date)
     if (
        typeof expenseDate !== "string" ||
        expenseDate.trim() === "" ||
        isNaN(new Date(expenseDate).getTime())
    )
    {
        return { valid: false, status: 400, message: "Invalid expense date" };
    }

    // Validate expenseIsPeriodic value
    if (typeof expenseIsPeriodic !== 'boolean')
    {        
        return { valid: false, status: 400, message: "Invalid expenseIsPeriodic value" };
    }

    const allowedPeriods = ["weekly", "monthly", "yearly"];
    // If the expense is periodic, validate the recurring period value.
    if (expenseIsPeriodic) 
    {
        // The recurring period value must be a string with a value 'weekly', 'monthly' or 'yearly'.
        if (
            typeof recurringPeriod !== "string" ||
            !allowedPeriods.includes(recurringPeriod)
        ) 
        {
            return { valid: false, status: 400, message: "Invalid recurring period" };
        }
    }
    else 
    {
        if (recurringPeriod !== undefined && recurringPeriod !== null) 
        {
            return { valid: false, status: 400, message: "The expense is not periodic" };
        }
    }
    // Everything is valid
    return {valid: true, status: 200, message: 'Expense input valid.'}
}
