import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Public key (make sure you have it available, typically loaded from an environment variable or a separate file)
const publicKey = process.env.public_key.replace(/\\n/g, '\n');// Make sure this is set in your .env file

const authenticate = (req, res, next) => {
    // Get the token from the Authorization header (usually in Bearer format)
    let token = req.header("Authorization");
    
    if (!token) {
        return res.status(401).json({ message: "Access denied, no token provided" });
    }
    
    // Remove any spaces before or after the token
    token = token.replace(/^JWT\s+/i, '').trim();

    try {
        // Verify the token using the public key (this will decode the token and also check its validity)
        const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] });

        // Attach the user_id to the request object for later use
        req.userId = decoded.user_id; // The user_id will be inside the payload of the token

        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        // If the token is invalid or expired
        return res.status(403).json({ message: "Invalid token" });
    }
};

export default authenticate;
