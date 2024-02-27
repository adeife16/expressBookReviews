const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware for session management
app.use("/customer", session({ secret: process.env.SESSION_SECRET || "fingerprint_customer", resave: true, saveUninitialized: true }));

// Authentication middleware
app.use("/customer/auth/*", function auth(req, res, next) {
    const token = req.headers.authorization; // Assuming token is passed in the Authorization header
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify JWT token
        req.user = decoded.user; // Add user information to request object
        next(); // Move to the next middleware
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
});

// Routes
app.use("/customer", customer_routes); // Customer routes requiring authentication
app.use("/", genl_routes); // General routes

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000; // Use environment variable for port or default to 5000

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
