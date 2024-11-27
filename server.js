const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Security headers middleware
app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self' data: blob: https://*.cloudinary.com; connect-src 'self' https://api.lumalabs.ai https://*.cloudinary.com; script-src 'self' 'unsafe-inline'");
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Serve static files from the root directory
app.use(express.static(__dirname));

// Body parser middleware
app.use(express.json());

// Main page route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Result page route
app.get('/result/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'result.html'));
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Serving static files from: ${__dirname}`);
});
