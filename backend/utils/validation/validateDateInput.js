/**
 * Function that parses and validates a date.
  @param {string | undefined | null} date - Date string in YYYY-MM-DD format
  @return {Date | null}
 */
export function parseAndValidateDate(date) {
  if (!date) return null;

  // Parse the date string in Date object.
  const parsed = new Date(date);

  // If the date is invalid, throw an error.
  if (Number.isNaN(parsed.getTime())) {
    throw { status: 400, message: "Invalid date provided" };
  }

  // Return the parsed date.
  return parsed;
}
