import { registerUser, authenticateUser, logout, checkIfUserIsLoggedIn, editUserData, deleteUser, getAllUsers  } from '../controllers/auth.js';
import express from 'express';
const router = express.Router();

// User login route: handles POST requests to /auth/login
router.post('/login', authenticateUser);
// User registration route: handles POST requests to /auth/register
router.post('/register', registerUser);
// User logout route: handles GET requests to /auth/logout
router.get('/logout', logout);
// Edit user data route: handles PATCH requests to /auth
router.patch('/', editUserData);
// A route used to check if the user is logged in: handles GET requests to /auth
router.get('/', checkIfUserIsLoggedIn)
// A route that handles user account deletion: handles DELETE requests to /auth/delete
router.delete('/', deleteUser)

router.get('/getAllUsers', getAllUsers)


export default router;