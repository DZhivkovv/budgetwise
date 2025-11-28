import {use} from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// Component that protects routes so only authorized users can access them
const ProtectedRoute = ({children}) => {
    // A context that tracks if the user is logged in or not.
    const { isLoggedIn } = use(AuthContext);

    // If the user is not logged in, redirect him to the login page.
    if (!isLoggedIn)
    {
        return <Navigate to='/login' replace/>
    }

    // If the user is logged in, he can access the route.
    return children;
}

export default ProtectedRoute;