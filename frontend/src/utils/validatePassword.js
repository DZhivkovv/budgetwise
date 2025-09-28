// A custom function that is used on user registration and ensures the user's password is valid.
export default function validatePassword(password, confirmPassword) {
    // A variable that tracks overall password validity.
    let passwordValidity = false;
    // Stores error messages for invalid password inputs
    let invalidPasswordMessages = [];

    // Validation rules: 
    // 1) At least 8 characters long.
    // 2) Contains at least one uppercase letter.
    // 3) Contains at least one lowercase letter.
    // 4) Contains at least one number.
    // 5) Contains at least one special character (!@#$%^&*).
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    
    // Checks if passwords match
    if (password !== confirmPassword) {

        // If the passwords do not match:
        // 1) Give informative message.
        invalidPasswordMessages.push("Passwords must match.");

        // 2) End function execution.
        return { isValid: passwordValidity, errors: invalidPasswordMessages };
    }

    // Check if password meets complexity requirements
    if (passwordRegex.test(password)) {
        // The password meets complexity requirements.
        passwordValidity = true;
    } else {
        // If the password doesn't meet complexity requirements:

        // 1) Inform the user that the provided password doesn't meet the requirements.
        invalidPasswordMessages.push("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
    }
    
    // Return password validity state and messages.
    return { isValid: passwordValidity, errors: invalidPasswordMessages };
}
