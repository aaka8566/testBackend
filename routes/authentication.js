import { Router } from "express";
import User from "../models/UserModel.js";
import jwtAccess from "../models/jwtAccess.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import authenticate from "../middlewares/getUser.js";

dotenv.config();
const privateKey = process.env.private_key.replace(/\\n/g, '\n');

const userRouter = Router();
// Register route
userRouter.post("/registerUser", async (req, res) => {
    const { user_id,username, email, password, phoneNumber } = req.body;
    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({
            user_id,
            username,
            email,
            password: hashedPassword,
            phoneNumber,
        });
        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Login route
userRouter.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "No user registered with this e-mail" });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ user_id: user._id }, privateKey, { algorithm: 'RS256' ,expiresIn: '1h' });
        const existingJwt = await jwtAccess.findOne({ user_id: user._id });

        if (existingJwt) {
            // If record exists, update the token and lastLogin timestamp
            existingJwt.token = token;
            existingJwt.lastLogin = new Date();
            await existingJwt.save();
        } else {
            // If no record exists, create a new JWT access record
            const newJwtAccess = new jwtAccess({
                user_id: user._id,
                token: token,
                lastLogin: new Date(),
            });
            await newJwtAccess.save();
        }
        res.status(200).json({
            message: "Login successful",
            token
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

userRouter.put("/logout", authenticate,async (req, res) => {
    const userId = req.userId;
    const jwt = await jwtAccess.findOne({ user_id: userId });
    if (jwt) {
        jwt.token = null;
        jwt.lastLogout = new Date();
        await jwt.save();
        return res.status(404).json({ message: "User logged out successfully" });
    } else {
        return res.status(404).json({ message: "User already logged out"});
    }
});

export { userRouter };
