/**
 * formatDate
 *
 * Formats a date string to YYYY-MM-DD format.
 *
 * If no date is provided, it returns today's date
 * in ISO format (YYYY-MM-DD).
 *
 * @param {string} date - ISO date string (e.g. "2026-03-01T12:00:00.000Z")
 * @returns {string} Formatted date in YYYY-MM-DD format
 */
export default function formatDate(date) {
  // If no date is passed, return today's date (YYYY-MM-DD)
  if (!date) return new Date().toISOString().slice(0, 10);

  // Extract only the date portion from ISO string
  return date.slice(0, 10);
}
