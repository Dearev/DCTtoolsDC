const express = require('express');
const fetch = require('node-fetch'); // v2
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/threads', async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 50;

    const response = await fetch(`https://www.democracycraft.net/api/threads?page=${page}&limit=${limit}`, {
      headers: {
        'XF-Api-Key': process.env.XF_API_KEY
      }
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch threads' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
