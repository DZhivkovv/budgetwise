import api from "../api/axiosInstance";

/**
 * Sends a GET request to retrieve all expenses that belong to the authenticated user from the server.
 *
 * @returns {Promise<AxiosResponse<object[]>>} A promise that resolves with the
 * Axios response object, which contains an array of expense objects in the `response.data` property.
 */
export const getAllUserExpenses = () => {
  return api.get("/expense/expenses");
};

/**
 * Sends a POST request to add an expense to the authenticated user's account.
 *
 * @returns {Promise<AxiosResponse<object[]>>} A promise that resolves with the
 * Axios response object.
 */
export const addExpense = (data) => {
  return api.post("/expense", data);
};

/**
 * Sends a PATCH request to edit an existing expense that belongs to the authenticated user.
 *
 * @returns {Promise<AxiosResponse<object[]>>} A promise that resolves with the
 * Axios response object.
 */
export const editExpense = async (data) => {
  await api.patch("/expense", data);
};

/**
 * Sends a GET request to retrieve filtered expenses for the authenticated user.
 *
 * The function expects a URLSearchParams instance containing the applied filters
 * (such as categories, date range, price range, and notes) and converts it into
 * a query string used by the backend filtering endpoint.
 *
 * Example:
 * const params = new URLSearchParams();
 * params.append("min", 50);
 * params.append("max", 200);
 *
 * @param {URLSearchParams} params - The query parameters representing filter criteria.
 * @returns {Promise<AxiosResponse>} A promise that resolves to the Axios response
 * containing the filtered list of expenses in `response.data`.
 */
export const filterExpenses = (params) => {
  return api.get(`/expense/expenses?${params.toString()}`);
};

/**
 * Sends a DELETE request to delete an existing expense that belongs to the authenticated user.
 *
 * @returns {Promise<AxiosResponse<object[]>>} A promise that resolves with the
 * Axios response object.
 */
export const deleteExpense = async (id) => {
  return api.delete(`/expense/${id}`);
};
