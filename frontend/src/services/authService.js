import api from "../api/axiosInstance";

/**
 * Fetches data for the currently authenticated user.
 *
 * Sends a GET request to `/auth/me`.
 * Requires a valid authentication cookie (JWT).
 *
 * @async
 * @function getAuthenticatedUserData
 * @returns {Promise<import("axios").AxiosResponse<{
 *   success: boolean,
 *   authenticated: boolean,
 *   data: Object|null,
 *   message?: string
 * }>>}
 *
 * @example
 * const response = await getAuthenticatedUserData();
 * const user = response.data.data;
 */
export const getAuthenticatedUserData = async () => {
  return api.get("/auth/me");
};

/**
 * Registers a new user account.
 *
 * Sends a POST request to `/auth/register` with user credentials.
 *
 * @async
 * @function registerUser
 * @param {Object} data - User registration data.
 * @param {string} data.firstName
 * @param {string} data.lastName
 * @param {number} data.age
 * @param {string} data.email
 * @param {string} data.password
 * @param {string} data.confirmPassword
 *
 * @returns {Promise<import("axios").AxiosResponse<{
 *   success: boolean,
 *   message: string
 * }>>}
 *
 * @example
 * await registerUser(formData);
 */
export const registerUser = async (data) => {
  return api.post("/auth/register", data);
};

/**
 * Logs out the currently authenticated user.
 *
 * Sends a GET request to `/auth/logout`.
 * Clears the HTTP-only authentication cookie on the server.
 *
 * @async
 * @function logout
 * @returns {Promise<import("axios").AxiosResponse<{
 *   success: boolean,
 *   message: string
 * }>>}
 *
 * @example
 * await logout();
 */
export const logout = async () => {
  return api.get("/auth/logout");
};
