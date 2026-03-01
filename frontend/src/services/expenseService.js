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
 * Sends a DELETE request to delete an existing expense that belongs to the authenticated user.
 *
 * @returns {Promise<AxiosResponse<object[]>>} A promise that resolves with the
 * Axios response object.
 */
export const deleteExpense = async (id) => {
  return api.delete(`/expense/${id}`);
};
