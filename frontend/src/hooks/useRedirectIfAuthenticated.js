import { useEffect, use } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

// Custom hook that redirects authenticated users away from restricted pages
// (e.g., login or register).
const useRedirectIfAuthenticated = (url) => {

    // A React router dom hook that is used for in-app navigation.
    const navigate = useNavigate();
    // A context that tracks if the user is logged in or not.
    const { isLoggedIn } = use(AuthContext);

    useEffect(()=>{
        // If the user is logged in:
        if( isLoggedIn === true )
        {
            // 1) He will be redirected to the app homepage
            navigate(url);
        }
    },[isLoggedIn]);

};

export default useRedirectIfAuthenticated;