/**
 * MONTH_NAMES
 *
 * Immutable array containing abbreviated month names.
 *
 * - Used for displaying month labels (charts, filters, summaries, etc.)
 * - Object.freeze prevents accidental modification at runtime.
 * - Index corresponds to JavaScript Date month index (0–11).
 *
 * Example:
 *   const month = MONTH_NAMES[new Date().getMonth()];
 */
export const MONTH_NAMES = Object.freeze([
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]);
