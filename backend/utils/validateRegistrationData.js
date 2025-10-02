// A function that validates the data the user provided on registration.
function validateRegistrationData(data) {
    const { firstName, lastName, age, email, password, confirmPassword } = data;
    const parsedAge = Number(age);

    // Check for correct field types 
    if (typeof firstName !== 'string' || typeof lastName !== 'string' || typeof age !== 'number' || typeof email !== 'string' ||
        typeof password !== 'string' || typeof confirmPassword !== 'string') 
    {
        return { valid: false, message: "Wrong field datatype!" };
    }

    // Check for empty fields
    if (!firstName?.trim() || !lastName?.trim() || !age || !email?.trim() || !password || !confirmPassword) 
    {
        return { valid: false, message: "All fields are required!" };
    }

    // Age validation. The user's age should be at least 13 and at most 120.
    if (isNaN(age) || age < 13 || age > 120) 
    {
        return { valid: false, message: "Your age must be a number between 13 and 120!" };
    }

    // Password strength
    // The password must be at least 8 chars and include uppercase, lowercase, number, and special character.
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(password)) 
    {
        return { valid: false, message: "Password must be at least 8 chars and include uppercase, lowercase, number, and special character." };
    }

    // Password match
    if (password !== confirmPassword) 
    {
        return { valid: false, message: "Passwords do not match." };
    }

    // All good
    return { valid: true };
}


export default validateRegistrationData;