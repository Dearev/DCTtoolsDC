const fs = require('fs');
const fetch = require('node-fetch');

const API_KEY = process.env.API_KEY;
const API_URL = 'https://www.democracycraft.net/api/threads?page=1&limit=50';

(async () => {
  try {
    const res = await fetch(API_URL, {
      headers: {
        'XF-Api-Key': API_KEY
      }
    });

    const data = await res.json();
    fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
    console.log('✅ Wrote API data to data.json');
  } catch (err) {
    console.error('❌ Fetch failed:', err);
    process.exit(1);
  }
})();
