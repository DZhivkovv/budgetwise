import axios from "axios";

/**
 * Pre-configured Axios instance for all API requests.
 *
 * This instance automatically:
 *  - Sends credentials (cookies, HTTP auth) with every request
 *  - Sets the `Content-Type` header to `application/json`
 *
 * Benefits:
 *  - No need to repeatedly configure base URL or headers in each API call
 *  - Ensures consistent configuration for requests
 *  - Enables cookies and sessions for authenticated endpoints
 *
 * Example usage:
 * ```js
 * import api from './axiosInstance';
 *
 * const response = await api.get('/budget');
 * ```
 */
const api = axios.create({
  baseURL: process.env.BACKEND_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
