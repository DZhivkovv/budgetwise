import express from 'express';
import db from '../models/index.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken'
dotenv.config();

import { registerUser, authenticateUser, logout, checkIfUserIsLoggedIn } from '../controllers/auth.js';

const router = express.Router();
const User = db.User;

// User login route: handles POST requests to /auth/login
router.post('/login', authenticateUser);
// User registration route: handles POST requests to /auth/register
router.post('/register', registerUser);
// User logout route: handles GET requests to /auth/logout
router.get('/logout', logout);
// A route used to check if the user is logged in: handles GET requests to /auth/isUserAuthenticated
router.get('/isUserAuthenticated', checkIfUserIsLoggedIn)

export default router;