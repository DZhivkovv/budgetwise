import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import validatePassword from "../../utils/validatePassword";

// Component handles user registration form state and submission
const RegistrationForm = () => {
    // State to store form input values
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        age: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    
    // A hook that is used to redirect user to another page.
    const navigate = useNavigate();

    // Handles form field value change - updates state with the new value.
    const handleChange = (event) => {
        const {name, value} = event.target;
        setFormData(prev => ({...prev, [name]: value}))
    }

    // Handles form submission and prevents default browser behavior
    const handleSubmit = async (event) => {
        event.preventDefault();
        // Check if the user password is valid (At least 8 characters - at least one uppercase letter, one lowercase letter, one number and one special symbol).
        const [passwordValidity, invalidPasswordMessages] = validatePassword(formData.password, formData.confirmPassword)

        // If the user password is valid, send POST request to registration endpoint with form data in order to register the user.
        if (passwordValidity === true)
        {
            try {
                const res = await axios.post("http://localhost:3000/auth/register", formData);

                // If the user is registered successfully, redirect him to the login page.
                if (res.status === 201) {
                    navigate("/auth/login");
                }
            } 
            catch (err) {
                console.error(err.response?.data || err.message);
            }
        }
    }

  return (
    // Form element with submit handler
    <form onSubmit={handleSubmit}>
        <div>
            {/* First name input */}
            <label>First name</label>
            <input type='text' name='firstName' onChange={handleChange} required/>
        </div>

        <div>
            {/* Last name input */}
            <label>Last name</label>
            <input type='text' name='lastName' onChange={handleChange} required/>
        </div>

        <div>
            {/* Age input */}
            <label>Age</label>
            <input type='number' name='age' min={16} onChange={handleChange} required/>
        </div>

        <div>
            {/* Email input */}
            <label>Email</label>
            <input type='text' name='email' onChange={handleChange} required/>
        </div>

        <div>
            {/* Password input */}
            <label>Password</label>
            <input type='password' name='password' onChange={handleChange} required/>
        </div>

        <div>
            {/* Confirm password input */}
            <label>Confirm Password</label>
            <input type='password' name='confirmPassword' onChange={handleChange} required/>
        </div>

        {/* Submit button */}
        <button type="submit">Register</button>
    </form>
  )
}

export default RegistrationForm