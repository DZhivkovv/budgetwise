/**
 * Builds a URL query string from a filters object.
 * Only includes parameters that have valid/non-empty values.
 *
 * @param {Object} filters - The filters object containing search criteria
 * @returns {URLSearchParams} - The constructed query parameters
 */
function buildQueryParams(filters) {
  const params = new URLSearchParams();

  // Add categories if at least one is selected
  if (filters.categories.length) {
    params.append("categories", filters.categories.join(","));
  }

  // Add date range filters if provided
  if (filters.date.from) {
    params.append("dateFrom", filters.date.from);
  }

  if (filters.date.to) {
    params.append("dateTo", filters.date.to);
  }

  // Add minimum price if it's not empty or null
  if (filters.price.min !== "" && filters.price.min !== null) {
    params.append("min", filters.price.min);
  }

  // Add maximum price if it's not empty or null
  if (filters.price.max !== "" && filters.price.max !== null) {
    params.append("max", filters.price.max);
  }

  // Add optional notes filter if provided
  if (filters.notes) {
    params.append("notes", filters.notes);
  }

  return params;
}

export default buildQueryParams;
