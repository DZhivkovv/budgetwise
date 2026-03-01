import api from "../api/axiosInstance";

/**
 * Sends a GET request to retrieve the currently active budget for the authenticated user.
 *
 * @returns {Promise<AxiosResponse<object[]>>} A promise that resolves with the
 * Axios response object, which contains an array of expense objects in the `response.data` property.
 */
export const getActiveUserBudget = async () => {
  return api.get("/budget");
};

/**
 * Sends a GET request to retrieve all budgets associated with the authenticated user.
 *
 * @returns {Promise<AxiosResponse<object[]>>} A promise that resolves with the
 * Axios response object, which contains an array of expense objects in the `response.data` property.
 */
export const getAllUserBudgets = async () => {
  return api.get("/budget/all");
};

/**
 * Sends a GET request to retrieve all expenses that belong to the authenticated user from the server.
 *
 * @returns {Promise<AxiosResponse<object[]>>} A promise that resolves with the
 * Axios response object, which contains an array of expense objects in the `response.data` property.
 */
export const createBudget = async (data) => {
  return api.post("/budget", data);
};

/**
 * Sends a GET request to retrieve all expenses that belong to the authenticated user from the server.
 *
 * @returns {Promise<AxiosResponse<object[]>>} A promise that resolves with the
 * Axios response object, which contains an array of expense objects in the `response.data` property.
 */
export const updateBudget = async (data) => {
  return api.patch("/budget", data);
};
