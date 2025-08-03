const fs = require('fs');
const fetch = require('node-fetch');

const API_KEY = process.env.API_KEY;
const PAGE_LIMIT = 50;
const BASE_URL = 'https://www.democracycraft.net/api/threads';

async function fetchAllPages() {
  let page = 1;
  const allThreads = [];

  while (true) {
    const res = await fetch(`${BASE_URL}?page=${page}&limit=${PAGE_LIMIT}`, {
      headers: {
        'XF-Api-Key': API_KEY
      }
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} - ${res.statusText}`);
    }

    const data = await res.json();
    const threads = data.threads;

    if (!threads || threads.length === 0) break;

    allThreads.push(...threads);

    if (threads.length < PAGE_LIMIT) break; // no more pages
    page++;
  }

  return allThreads;
}

(async () => {
  try {
    const threads = await fetchAllPages();
    fs.writeFileSync('data.json', JSON.stringify({ threads }, null, 2));
    console.log(`✅ Fetched ${threads.length} threads`);
  } catch (err) {
    console.error('❌ Fetch failed:', err);
    process.exit(1);
  }
})();
