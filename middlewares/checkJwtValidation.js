import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import jwtAccess from '../models/jwtAccess.js'; // Adjust the path as necessary

dotenv.config();

// Public key (make sure you have it available, typically loaded from an environment variable or a separate file)
const publicKey = process.env.public_key.replace(/\\n/g, '\n');// Make sure this is set in your .env file
const sessionTimeoutMins = parseInt(process.env.SESSION_TIMEOUT_MINS, 10);

const authenticateLoginStatus = async(req, res, next) => {
    // Get the token from the Authorization header (usually in Bearer format)
    let token = req.header("Authorization");
    
    if (!token) {
        return res.status(401).json({ message: "Access denied, no token provided" });
    }
    
    // Remove any spaces before or after the token
    token = token.replace(/^JWT\s+/i, '').trim();

    try {
        const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] });

        // Attach the user_id to the request object for later use
        req.userId = decoded.user_id;
        const jwtRecord = await jwtAccess.findOne({ user_id: decoded.user_id, token: token });
        
        if (!jwtRecord.token) {
            return res.status(403).json({ message: "User logged out , session invalid" });
        }

        // Calculate the expiration time dynamically based on the session timeout in minutes
        const now = new Date();
        const sessionExpirationTime = new Date(now.getTime() + sessionTimeoutMins * 60000); // Convert minutes to milliseconds

        // Check if the token has expired by comparing the expiration time
        if (new Date() > sessionExpirationTime) {
            return res.status(403).json({ message: "Session has expired" });
        }
        next();
    } catch (error) {
        // If the token is invalid or expired
        return res.status(403).json({ message: "Invalid token" });
    }
};

export default authenticateLoginStatus;
