import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Utility functions
import validatePassword from "../../utils/validatePassword";
// Global CSS styles.
import '../../styles/forms.css'

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
        const {passwordValidity, invalidPasswordMessages } = validatePassword(formData.password, formData.confirmPassword)

        // If the user password is valid, send POST request to registration endpoint with form data in order to register the user.
        if (passwordValidity === true)
        {
            try {
                const res = await axios.post("http://localhost:3000/auth/register", formData);

                // If the user is registered successfully, redirect him to the login page.
                if (res.status === 201)
                {
                    navigate("/login");
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
            
        {/* First name input */}
        <input className="g_form__input" name='firstName' placeholder="First Name" onChange={handleChange} required/>

        {/* Last name input */}
        <input className="g_form__input" name='lastName' placeholder="Last Name" onChange={handleChange} required/>

        {/* Age input */}
        <input className="g_form__input" type='number' name='age' min={16} placeholder="Age" onChange={handleChange} required/>

        {/* Email input */}
        <input className="g_form__input" type='text' name='email' placeholder="Email" onChange={handleChange} required/>

        {/* Password input */}
        <input className="g_form__input" type='password' name='password' placeholder="Password" onChange={handleChange} required/>

        {/* Confirm password input */}
        <input className="g_form__input" type='password' name='confirmPassword' placeholder="Confirm Password" onChange={handleChange} required/>

        {/* Submit button */}
        <button className="g_form__submit" type="submit">Create Account</button>
    </form>
  )
}

export default RegistrationForm