/**
 * Calculates the next occurrence date based on a recurring period,
 * automatically correcting invalid rollover dates (e.g. Feb 30 → Feb 28).
 *
 * @param {string} expenseDate - The base date in format "YYYY-MM-DD".
 * @param {('weekly'|'monthly'|'yearly')} recurringPeriod - Recurrence interval.
 *
 * @returns {string} - The next occurrence date in "YYYY-MM-DD" format.
 *
 * @throws {Error} If expenseDate is invalid or recurringPeriod is invalid.
 */
export default function calculateNextExpenseDate(expenseDate, recurringPeriod) {
    // Validate input date
    const parsed = new Date(expenseDate);
    if (!expenseDate || isNaN(parsed.getTime())) {
        throw new Error("Invalid or missing expense date");
    }

    // Validate recurring period
    const validPeriods = ["weekly", "monthly", "yearly"];
    if (!validPeriods.includes(recurringPeriod)) {
        throw new Error("Invalid recurring period");
    }

    // Clone the date to avoid mutation
    const date = new Date(parsed);
    const originalDay = date.getDate();

    switch (recurringPeriod) {
        case "weekly":
            date.setDate(date.getDate() + 7);
            break;

        case "monthly":
            date.setMonth(date.getMonth() + 1);
            break;

        case "yearly":
            const targetMonth = date.getMonth();
            date.setFullYear(date.getFullYear() + 1);

            if (date.getMonth() !== targetMonth) {
                date.setDate(0);
            }

            break;
    }

    // Format YYYY-MM-DD manually
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}
