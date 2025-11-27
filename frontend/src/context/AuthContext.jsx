import { useState, useEffect, createContext } from 'react'
import axios from 'axios';

export const AuthContext = createContext({
    isLoggedIn: false, 
    setIsLoggedIn: () => {} 
});

export default function AuthProvider({children}) {
    // A state that tracks if the user is logged in.
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // On mount, check if the user is already authenticated 
    useEffect(() => {
        axios.get('http://localhost:3000/auth/isUserAuthenticated', { withCredentials: true })
            .then(({ data }) => {
                // Update auth state based on backend response
                setIsLoggedIn(data.success ? true : false);
            })
            .catch(() => {
                // If request fails (e.g., no cookie, server error), assume not logged in
                setIsLoggedIn(false);
            });
    }, []);

    // Provides authentication state and updater to all children
    return (
        <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
            {children}
        </AuthContext.Provider>
    )
}
