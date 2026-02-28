/**
 * Links visible to all authenticated users.
 */
export const MAIN_LINKS = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Statistics", path: "/statistics" },
];

/**
 * Authentication links for non-logged-in users.
 */
export const AUTH_LINKS_PUBLIC = [
  { label: "Log In", path: "/login" },
  { label: "Register", path: "/register" },
];

/**
 * Authentication links for logged-in users.
 */
export const AUTH_LINKS_PRIVATE = [{ label: "Logout", path: "/logout" }];
