import { useState, use} from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";

// LoginForm component manages login form state and submission
const LoginForm = () => {    
    // A react router dom hook used for in-app navigation
    const navigate = useNavigate();
    // A context that tracks user's authentication state. It is used in this component to change the user's auth state to true on successful login
    const { setIsLoggedIn } = use(AuthContext); 

    // State to store email and password input values
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    // Function that handles form field value change and updates state with the new value.
    const handleChange = (event) => {
        const {name, value} = event.target;
        setFormData(prev => ({...prev, [name]: value}))
    }

    // Async function that handles form submission:
    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevents page reload on form submit

        try
        {
            // Sends POST request to login endpoint with form data
            const { status } = await axios.post('http://localhost:3000/auth/login', formData, { withCredentials: true });

            // If the user login is successful:
            if (status === 200) {
                // 1) Mark the user as logged in to restrict the user's access to the login and register page while authenticated.
                setIsLoggedIn(true);

                // 2) Redirect to homepage.
                navigate('/');
            }
        }
        catch (error)
        {
            // If the user login fails:
            // 1) Reset auth state.
            setIsLoggedIn(false);

            // 1) Log the error.
            console.error(error);
        }
    }

  return (
    // Form element with submit handler
    <form onSubmit={handleSubmit}>
        <div>
            {/* Email input field */}
            <label>Email: </label>
            <input 
                type='email' 
                name='email' 
                onChange={handleChange}                
                required
            />
        </div>

        <div>
            {/* Password input field */}
            <label>Password:</label>
            <input 
                type='password' 
                name='password' 
                onChange={handleChange} 
                required
            />
        </div>

        {/* Submit button */}
        <button>Login</button>
    </form>
  )
}

export default LoginForm