import { useState, useEffect, createContext } from 'react'
import axios from 'axios';

export const AuthContext = createContext({
    isLoggedIn: false, 
    setIsLoggedIn: () => {} 
});

export default function AuthProvider({children}) {
    // A state that tracks if the user is logged in.
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    // A state that contains the logged user's id.
    const [userId, setUserId] = useState('');

    const [isLoading, setIsLoading] = useState(true);

    // On mount, check if the user is already authenticated 
    useEffect(() => {
        axios
            .get('http://localhost:3000/auth', { withCredentials: true })
            .then(({ data }) => {
                setIsLoggedIn(!!data.success);
                setUserId(data.user?.id || '');
            })
            .catch(() => {
                setIsLoggedIn(false);
                setUserId('');
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    // Provides authentication state and updater to all children
    return (
        <AuthContext.Provider value={{ isLoading, userId, setUserId, isLoggedIn, setIsLoggedIn }}>
            {children}
        </AuthContext.Provider>
    )
}
