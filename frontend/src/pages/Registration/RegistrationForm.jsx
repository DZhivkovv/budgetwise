import { useContext, useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from "../../context/AuthContext";
import validatePassword from "../../utils/auth/validatePassword";

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

    const [errorMessage, setErrorMessage] = useState("");
    const { register } = useContext(AuthContext) 
    
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

        const { passwordValidity, invalidPasswordMessages } = 
            validatePassword(formData.password, formData.confirmPassword);

        if (!passwordValidity) {
            setErrorMessage(invalidPasswordMessages.join(" "));
            return; 
        }

        try {
            const res = await register(formData);

            if (res.status === 201) {
                navigate("/login");
            }
        } catch (error) {
            const msg = error.response?.data?.message || "Something went wrong";
            setErrorMessage(msg);
        }
    };

  return (
    // Form element with submit handler
    <form onSubmit={handleSubmit} class="g_items-in-a-column">

        <div className="g_error-message-container">
        {errorMessage && (
            <p className="g_error-message">{errorMessage}</p>
        )}
        </div>

        {/* First name */}
        <input 
            className="g_form__input" 
            name="firstName" 
            placeholder="First Name" 
            onChange={handleChange} 
            required
        />

        {/* Last name */}
        <input 
            className="g_form__input" 
            name="lastName" 
            placeholder="Last Name" 
            onChange={handleChange} 
            required
        />

        {/* Age */}
        <input 
            className="g_form__input" 
            type="number" 
            name="age" 
            min={16} 
            placeholder="Age" 
            onChange={handleChange} 
            required
        />
        
        {/* Email */}
        <input 
            className="g_form__input" 
            type="text"
            name="email" 
            placeholder="Email" 
            onChange={handleChange} 
            required
        />
        
        {/* Password */}
        <input 
            className="g_form__input" 
            type="password" 
            name="password" 
            placeholder="Password" 
            onChange={handleChange} 
            required
        />
        
        {/* Confirm password */}
        <input 
            className="g_form__input" 
            type="password" 
            name="confirmPassword" 
            placeholder="Confirm Password" 
            onChange={handleChange} 
            required
        />
        
        {/* Submit form */}
        <button className="g_form__submit" type="submit">Create Account</button>
    </form>
  )
}

export default RegistrationForm