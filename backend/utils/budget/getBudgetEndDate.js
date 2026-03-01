/**
 * Calculates the date one month after the initial budget date,
 * gracefully handling month-end rollovers.
 * @param {Date} budgetStartDate - The Date object created from the createdAt field.
 * @returns {Date} The date the budget should be renewed.
 */
export function getBudgetEndDate(budgetStartDate) {
    // Create a copy of the date
    const endDate = new Date(budgetStartDate); 

    // Store the original day
    const originalDay = endDate.getDate(); 

    // Advance the month by 1
    endDate.setMonth(endDate.getMonth() + 1); 

    // If advancing the month caused rollover (e.g., Jan 31 -> Mar 3)
    if (endDate.getDate() < originalDay) {
        // Set the day to 0 of the current month (which is the last day of the previous month)
        endDate.setDate(0); 
    }

    return endDate;
}

export default getBudgetEndDate;