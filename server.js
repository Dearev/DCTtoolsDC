const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;

app.use(cors());

app.get('/threads', async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 50;

    const response = await fetch(`https://www.democracycraft.net/api/threads?page=${page}&limit=${limit}`, {
      headers: {
        'XF-Api-Key': API_KEY
      }
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
