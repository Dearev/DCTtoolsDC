// server.js

const express = require('express');
const path = require('path');
const app = express();

// Use environment port or default to 3000
const port = process.env.PORT || 3000;

// Serve all static files (HTML, JS, CSS, etc.) from the root directory
app.use(express.static(path.join(__dirname)));

// Optional: fallback route for unknown paths (redirects to index.html or 404 message)
app.get('*', (req, res) => {
  res.status(404).send('404 - Page Not Found');
});

// Start the server
app.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});
