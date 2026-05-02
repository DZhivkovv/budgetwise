/**
 * Converts a comma-separated string or array into an array.
 * If input is falsy, returns an empty array.
 *
 * @param {string|string[]} input - Input value to normalize
 * @returns {string[]} - Array of values
 */
function parseToArray(input) {
  if (!input) return [];

  // If already an array, return as-is
  return Array.isArray(input) ? input : input.split(",");
}

/**
 * Trims whitespace from each string in an array and removes empty values.
 *
 * @param {string[]} arr - Array of strings to normalize
 * @returns {string[]} - Cleaned array with trimmed, non-empty strings
 */
function normalizeArrayOfStrings(arr) {
  return arr
    .map((item) => item.trim()) // Remove extra whitespace
    .filter((item) => item.length > 0); // Remove empty strings
}

export { parseToArray, normalizeArrayOfStrings };
