/**
 * Links visible to all authenticated users.
 */
export const MAIN_LINKS = Object.freeze([
  { label: "Dashboard", path: "/dashboard" },
  { label: "Statistics", path: "/statistics" },
]);

/**
 * Authentication links for non-logged-in users.
 */
export const AUTH_LINKS_PUBLIC = Object.freeze([
  { label: "Log In", path: "/login" },
  { label: "Register", path: "/register" },
]);

/**
 * Authentication links for logged-in users.
 */
export const AUTH_LINKS_PRIVATE = Object.freeze([
  { label: "Logout", path: "/logout" },
]);
