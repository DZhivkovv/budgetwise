import { createContext, useState, useEffect } from "react";
import { getAuthenticatedUserData, logout } from "../services/authService.js";
import { registerUser } from "../services/authService.js";

export const AuthContext = createContext({
    isLoggedIn: false,
    isLoading: false,
    user: null,
    error: null,
    login: ()=>{},
    register: () => {},
    logoutUser: () => {},
});

export default function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  const setAuthManually = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
    setIsLoading(false);
  };

  const fetchMe = async () => {
    try 
    {
      const { data } = await getAuthenticatedUserData();
      if (data.authenticated) 
      {
        setIsLoggedIn(true);
        setUser(data.data);
      } 
      else 
      {
        setIsLoggedIn(false);
        setUser(null);
      }
    } 
    catch 
    {
      setIsLoggedIn(false);
      setUser(null);
    } 
    finally 
    {
      setIsLoading(false);
    }
  };

  const register = async(data) => {
    setIsLoading(true);
    try {
      const res = await registerUser(data);
      return res;    } catch (error) {
      setError(error.response?.data?.message || "Something went wrong");
      throw error; 
    } finally {
      setIsLoading(false);
    }
  }

  const logoutUser = async () => {
    try 
    {
      setError(null);
      await logout();
    } 
    catch (error) 
    {
      setError(error)
    } 
    finally 
    {
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        await fetchMe();
      } catch (err) {
        console.error("fetchMe failed", err);
      }
    };
    loadUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isLoading,
        user,
        error,
        login: fetchMe,
        setAuthManually,
        register,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
