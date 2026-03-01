import api from "../api/axiosInstance";

/**
 * Sends a GET request to retrieve all goals from the server.
 *
 * @returns {Promise<AxiosResponse<object[]>>} A promise that resolves with the
 * Axios response object, which contains an array of goal objects
 * in the `response.data` property.
 */
export const getGoals = () => {
  return api.get("/goal/goals");
};

/**
 * Sends a POST request to create a new goal on the server.
 *
 * @async
 * @param {object} data The data for the new goal (e.g., title, target, due_date).
 * @returns {Promise<void>} A promise that resolves when the goal is successfully created.
 * @throws {Error} If the API request fails (e.g., validation error, server error).
 */
export const createGoal = async (data) => {
  await api.post("/goal", data);
};

/**
 * Sends a DELETE request to remove a specific goal by its ID.
 *
 * @async
 * @param {number|string} goalId The unique identifier of the goal to be deleted.
 * @returns {Promise<AxiosResponse<any>>} A promise that resolves with the
 * Axios response object upon successful deletion.
 * @throws {Error} If the API request fails (e.g., goal not found, permission denied).
 */
export const deleteGoal = async (goalId) => {
  return api.delete(`/goal/${goalId}`);
};
