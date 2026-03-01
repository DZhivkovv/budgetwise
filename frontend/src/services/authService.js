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
 * Authenticates a user with the backend and sets an HTTP-only JWT cookie.
 *
 * Sends a POST request to `/auth/login` with the user's email and password.
 *
 * @async
 * @function login
 * @param {Object} data - User login credentials.
 * @param {string} data.email - The user's email address.
 * @param {string} data.password - The user's password.
 * @returns {Promise<import("axios").AxiosResponse<{
 *   success: boolean,
 *   message: string,
 *   data?: Object
 * }>>} - Axios response object containing success status, message, and user data.
 *
 * @example
 * const response = await login({ email: "user@example.com", password: "password123" });
 * if (response.data.success) {
 *   console.log("Logged in!", response.data.data);
 * }
 */
export const login = async (data) => {
  return api.post("/auth/login", data);
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
