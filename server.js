// server.js
const express = require('express');
const fetch = require('node-fetch'); // v2 for CommonJS
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files (like im-tool.js, HTML, CSS)
app.use(express.static(path.join(__dirname, 'public')));

// Proxy for /threads
app.get('/threads', async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 50;

    const response = await fetch(`https://www.democracycraft.net/api/threads?page=${page}&limit=${limit}`, {
      headers: {
        'XF-Api-Key': process.env.XF_API_KEY
      }
    });

    if (!response.ok) {
      return res.status(response.status).send(`Upstream error ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('❌ Proxy failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
