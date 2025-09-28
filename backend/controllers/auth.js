import db from "../models/index.js";
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken'

// Import User model from the database
const User = db.User;

/* Authenticate user (login) */
export async function authenticateUser(req,res)
{
    try
    {
        // Get user email and password from request body
        const {email, password} = req.body;

        // Find user by email in the database
        const user = await User.findOne({where: { email }});
        if (!user)
        {
            // If user not found, return unauthorized response
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        // Compare provided password with hashed password in the database
        const passwordsMatch = bcrypt.compareSync(password, user.password); 
        if (!passwordsMatch)
        {
            // If password does not match, return unauthorized response
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
        
        // Generate JWT token for authenticated user
        const token = jwt.sign(
            { id: user.id, email: user.email }, 
            process.env.JWT_SECRET,             
            { expiresIn: '1h' }                 
        );
    
        // Store JWT token in HTTP-only cookie
        res.cookie("auth-token", token, {
            httpOnly: true,   
            secure: false,   
            sameSite: "lax"   
        });
            
        // Send success response
        return res.status(200).json({ success: true, message: 'User logged in successfully' });
    }
    catch (err)
    {
        // Handle unexpected server errors
        res.status(500).json({ 
            success: false, 
            message: 'Server error', 
            error: err.message 
        });
    }
}


/* Register a new user (sign-up) */
export async function registerUser(req, res)
{
    // Get the user data from the registration form
    const {firstName, lastName, age, email, password} = req.body;

    // Validate password strength
    // Must be at least 8 chars, contain uppercase, lowercase, number, and special char
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(password)) {
        return res.status(400).json({ 
            success: false, 
            message: "Password must be at least 8 chars and include uppercase, lowercase, number, and special character." 
        });
    }

    // Hash the password using bcrypt
    const saltRounds = parseInt(process.env.SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    try
    {
        // Create new user in the database with hashed password
        const user = await User.create({
          firstName,
          lastName,
          age,
          email,
          password: hashedPassword,
        })
        
        // Send success response if registration is successful
        res.status(201).json({ success:true, message: 'Registration successful' });
    }
    catch (err)
    {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
}


/* Log out user (clear auth cookie) */
export function logout(req, res)
{
    // Remove JWT cookie from the browser
    res.status(202).clearCookie('auth-token').send('Cookie cleared.')
}


/* Check if a user is logged in (verify JWT token) */
export async function checkIfUserIsLoggedIn(req, res)
{
    // Extract token from cookies
    const token = req.cookies['auth-token']
    if (!token)
    {
        // If no token, user is not logged in
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    try
    {
        // Verify the token with the secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET); 

        // If valid, return success and decoded user info
        return res.status(200).json({
            success: true,
            message: "User is authenticated",
            user: decoded
        });  
    }
    catch(error)
    {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
}
