const fs = require('fs');
const fetch = require('node-fetch');

const API_KEY = process.env.API_KEY;
const PAGE_LIMIT = 50;
const TARGET_NODE_ID = 62;
const BASE_URL = 'https://www.democracycraft.net/api/threads';
const MAX_PAGES = 100; // safety limit for pagination

if (!API_KEY) {
  console.error('❌ Missing API_KEY in environment variables');
  process.exit(1);
}

const today = new Date();
today.setHours(0, 0, 0, 0);

function extractDateFromTitle(title) {
  const match = title.match(/\|\s*([A-Za-z]{3,9}) (\d{1,2}), (\d{4})/);
  if (!match) return null;
  const [, monthStr, dayStr, yearStr] = match;

  const monthMap = {
    Jan: 0, January: 0,
    Feb: 1, February: 1,
    Mar: 2, March: 2,
    Apr: 3, April: 3,
    May: 4,
    Jun: 5, June: 5,
    Jul: 6, July: 6,
    Aug: 7, August: 7,
    Sep: 8, September: 8,
    Oct: 9, October: 9,
    Nov: 10, November: 10,
    Dec: 11, December: 11
  };

  const parsed = new Date(parseInt(yearStr), monthMap[monthStr], parseInt(dayStr));
  parsed.setHours(0, 0, 0, 0);
  return parsed;
}

// Retry-once fetch wrapper
async function safeFetch(url, options, retries = 1) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url, options);
    if (res.ok) return res;

    const text = await res.text();
    if (res.status === 400) {
  const text = await res.text();

  // Check if it's the invalid_page error, and break the pagination loop
  if (text.includes('"code":"invalid_page"')) {
    console.log('✅ Reached the last valid page');
    break; // exit pagination loop
  }

  if (attempt < retries) {
    console.warn(`⚠️ HTTP 400 on attempt ${attempt + 1}, retrying...`);
    await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
    continue;
  }

  throw new Error(`HTTP 400 - Bad Request\nURL: ${url}\nBody: ${text}`);
}

      console.warn(`⚠️ HTTP 400 on attempt ${attempt + 1}, retrying...`);
      await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
      continue;
    }

    throw new Error(`HTTP ${res.status} - ${res.statusText}\nURL: ${url}\nBody: ${text}`);
  }
}

async function fetchAllThreads() {
  let page = 1;
  const allThreads = [];

  while (page <= MAX_PAGES) {
    const url = `${BASE_URL}?page=${page}&limit=${PAGE_LIMIT}`;
    console.log(`🔄 Fetching page ${page}: ${url}`);

    const res = await safeFetch(url, {
      headers: { 'XF-Api-Key': API_KEY }
    });

    let data;
    try {
      data = await res.json();
    } catch (err) {
      const text = await res.text();
      throw new Error(`Failed to parse JSON. Raw response: ${text}`);
    }

    const threads = data.threads;
    if (!threads || threads.length === 0) break;

    allThreads.push(...threads);
    if (threads.length < PAGE_LIMIT) break;

    page++;
  }

  return allThreads;
}

(async () => {
  try {
    const allThreads = await fetchAllThreads();

    const filtered = allThreads.filter(t => {
      if (t.node_id !== TARGET_NODE_ID) return false;
      if (t.prefix_id === 130) return true;

      if (t.prefix_id === 5) {
        const date = extractDateFromTitle(t.title);
        return date && date <= today;
      }

      return false;
    });

    const minimalThreads = filtered.map(t => ({
      thread_id: t.thread_id,
      title: t.title,
      prefix_id: t.prefix_id,
      view_url: t.view_url
    }));

    fs.writeFileSync('data.json', JSON.stringify({ threads: minimalThreads }, null, 2));
    console.log(`✅ Saved ${minimalThreads.length} filtered threads`);
  } catch (err) {
    console.error('❌ Fetch failed:', err.message);
    process.exit(1);
  }
})();
