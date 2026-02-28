import {use} from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Loader from './Loader.jsx';

/**
 * ProtectedRoute component.
 *
 * Wraps a route and restricts access to authenticated users only.
 * - If the authentication state is still loading, show a loader.
 * - If the user is not logged in, redirect to the login page.
 * - Otherwise, render the protected content.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Components to render if the user is authenticated.
 * @returns {React.ReactNode} Either the children components, a Loader, or a Navigate redirect.
 */
const ProtectedRoute = ({children}) => {
    // A context that tracks if the user is logged in or not.
    const { isLoggedIn, isLoading } = use(AuthContext);

    if (isLoading) {
        return <Loader visibility={isLoading}/>
    }

    // If the user is not logged in, redirect him to the login page.
    if (!isLoggedIn)
    {
        return <Navigate to='/login' replace/>
    }

    // If the user is logged in, he can access the route.
    return children;
}

export default ProtectedRoute;