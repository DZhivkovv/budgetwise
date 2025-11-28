/**
 * Validates the registration data submitted by a user.
 *
 * This function performs several checks:
 * - Ensures all required fields exist and are of the correct datatype.
 * - Ensures fields do not contain empty or whitespace-only values.
 * - Validates age: must be a safe integer between 13 and 120.
 * - Validates email format.
 * - Validates password strength (uppercase, lowercase, number, special char, min length 8).
 * - Ensures password and confirmPassword fields match.
 *
 * @param {Object} data - The user-submitted registration data.
 * @param {string} data.firstName - The user's first name.
 * @param {string} data.lastName - The user's last name.
 * @param {number|string} data.age - The user's age. Can be a number or a numeric string.
 * @param {string} data.email - The user's email address.
 * @param {string} data.password - The user's chosen password.
 * @param {string} data.confirmPassword - Confirmation of the chosen password.
 *
 * @returns {{ valid: boolean, message: string }} 
 * An object indicating whether the validation passed.
 * - `valid: true` → All checks succeeded.
 * - `valid: false` → Validation failed, and `message` contains the reason.
 *
 * Possible error messages:
 * - "Wrong field datatype!"
 * - "All fields are required!"
 * - "Your age must be a whole number between 13 and 120!"
 * - "Invalid email address."
 * - "Password must be at least 8 chars and include uppercase, lowercase, number, and special character."
 * - "Passwords do not match."
 * - "Registration data valid"
 */
function validateRegistrationData(data) {
    const { firstName, lastName, age, email, password, confirmPassword } = data;
    const parsedAge = Number(age);
    
    // Check for correct field types 
    if (
        // First name should be a string
        typeof firstName !== 'string' ||
        // Last name should be a string
        typeof lastName !== 'string' || 
        // Age should be a number
        isNaN(age) || 
        // Email should be a string
        typeof email !== 'string' ||
        // Password should be a string
        typeof password !== 'string' || 
        // Confirm password should be a string
        typeof confirmPassword !== 'string'
    ) 
    {
        return { valid: false, message: "Wrong field datatype!" };
    }
    
    const trimmedEmail = email?.trim();
    // Check for empty fields
    if (!firstName?.trim() || !lastName?.trim() || !age || !trimmedEmail || !password || !confirmPassword) {
        return { valid: false, message: "All fields are required!" };
    }

    // Age validation
    if ( isNaN(parsedAge) || !Number.isSafeInteger(parsedAge) || parsedAge < 13 || parsedAge > 120 ) 
    {
        return { valid: false, message: "Your age must be a whole number between 13 and 120!" };
    }


    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
        return { valid: false, message: "Invalid email address." };
    }

    // Password strength
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(password)) {
        return { valid: false, message: "Password must be at least 8 chars and include uppercase, lowercase, number, and special character." };
    }

    // Password match
    if (password !== confirmPassword) {
        return { valid: false, message: "Passwords do not match." };
    }

    return { valid: true, message: "Registration data valid" };
}

export default validateRegistrationData;
