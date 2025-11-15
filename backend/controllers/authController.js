import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

import nodemailer from 'nodemailer';
import { validationResult } from 'express-validator';


// export const registerUser = async (req, res) => {
//     const { name, email, password, confirmPassword, role, blockchainWallet } = req.body;

//     // Check if passwords match
//     if (password !== confirmPassword) {
//         return res.status(400).json({ message: 'Passwords do not match' });
//     }

//     // Email validation (checks if it ends with @gmail.com)
//     const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
//     if (!emailRegex.test(email)) {
//         return res.status(400).json({ message: 'Please enter a valid Gmail address (ending with @gmail.com)' });
//     }

//     // Check if user already exists
//     const userExists = await User.findOne({ email });
//     if (userExists) {
//         return res.status(400).json({ message: 'User already exists' });
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create new user
//     const user = new User({
//         name,
//         email,
//         password: hashedPassword,
//         role,
//         blockchainWallet,
//     });

//     // Save the user
//     const savedUser = await user.save();
//     res.status(201).json({ message: 'User registered successfully', user: savedUser });
// };



export const registerUser = async (req, res) => {
        const { name, email, password, confirmPassword, role, blockchainWallet } = req.body;
    
        // Check if passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }
    
        // Email validation (accepts any valid email format)
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Please enter a valid email address' });
        }
    
        // Blockchain wallet validation (ensures it's exactly 12 digits)
        const walletRegex = /^\d{12}$/;
        if (blockchainWallet && !walletRegex.test(blockchainWallet)) {
            return res.status(400).json({ message: 'Invalid Aadhaar number. Please enter a 12-digit number.' });
        }
    
        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
    
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
    
        // Create new user
        const user = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'user', // Default to 'user' if no role provided
            blockchainWallet: blockchainWallet || '', // Default to empty string if no wallet provided
        });
    
        // Save the user
        try {
            const savedUser = await user.save();
            res.status(201).json({ message: 'User registered successfully', user: savedUser });
        } catch (error) {
            console.error('Error saving user:', error);
            res.status(500).json({ message: 'Error occurred during registration. Please try again.' });
        }
    };
    


export const loginUser = async (req, res) => {
    try {
        console.log('Login request received:', JSON.stringify(req.body, null, 2));
        
        const { email, password, role = 'user' } = req.body; // Default role to 'user' if not provided

        // Basic validation
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        // Email validation (accepts any valid email format)
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
        }

        // Find user by email with case-insensitive search
        const user = await User.findOne({ 
            email: { $regex: new RegExp('^' + email + '$', 'i') } 
        });
        
        console.log('User lookup result for email:', email, 'found:', !!user);
        
        if (!user) {
            // Check if any users exist in the database at all
            const anyUser = await User.findOne({});
            console.log('Any user exists in database:', !!anyUser);
            
            if (!anyUser) {
                console.log('No users found in the database. The database might be empty.');
                return res.status(400).json({ 
                    success: false, 
                    message: 'No users found in the system. Please register first.' 
                });
            }
            
            // Check if the email exists with different case
            const similarEmailUser = await User.findOne({
                email: { $regex: email, $options: 'i' }
            });
            
            if (similarEmailUser) {
                console.log('Found similar email with different case:', similarEmailUser.email);
                return res.status(400).json({ 
                    success: false, 
                    message: 'Email case mismatch. Try ' + similarEmailUser.email 
                });
            }
            
            return res.status(400).json({ 
                success: false, 
                message: 'No account found with this email. Please register first.' 
            });
        }

        // Check if password is valid
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.log('Invalid password for user:', email);
            
            // Check if the password is being hashed correctly
            console.log('Stored password hash:', user.password.substring(0, 10) + '...');
            
            // For debugging: Log if the password matches when hashed directly
            const testHash = await bcrypt.hash(password, 10);
            console.log('Test hash of provided password:', testHash.substring(0, 10) + '...');
            
            return res.status(400).json({ 
                success: false, 
                message: 'The password you entered is incorrect. Please try again or reset your password.' 
            });
        }

        // Check if user role matches
        if (user.role !== role) {
            console.log(`Role mismatch for ${email}. Expected: ${role}, Actual: ${user.role}`);
            return res.status(403).json({ 
                success: false, 
                message: `Access denied. This account is registered as ${user.role}.` 
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user._id, 
                role: user.role,
                email: user.email
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' } // Increased token expiry
        );

        // Prepare user data to send back (exclude password)
        const userData = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            blockchainWallet: user.blockchainWallet
        };

        console.log('Login successful for user:', user.email);
        
        // Send response with the token and user info
        res.json({ 
            success: true, 
            message: 'Login successful',
            token,
            user: userData
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during login',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};



 

// Forgot Password

export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // Email validation (checks if it ends with @gmail.com)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Please enter a valid Gmail address (ending with @gmail.com)' });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: 'User with this email does not exist' });
    }

    // Generate a reset token
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Create transporter to send reset email
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    try {
        // Send email with the reset link
        await transporter.sendMail({
            to: email,
            subject: 'Password Reset',
            html: `<p>You requested a password reset. Click <a href="${resetUrl}">here</a> to reset your password.</p>`,
        });
        res.status(200).json({ message: 'Reset link sent to your email' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Error sending email. Please try again later.' });
    }
};

// Reset Password
export const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(400).json({ message: 'Invalid token' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Invalid token or token expired' });
    }
};
 
// Create logic for logOut
export const logOutUser = async (req, res) => {
    try {
        // Clear the token from the client-side (e.g., using localStorage)
        res.clearCookie('token'); // Assuming you're using cookies for authentication
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

