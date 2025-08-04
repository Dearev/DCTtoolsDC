const fs = require('fs');
const fetch = require('node-fetch');

const API_KEY = process.env.API_KEY;
const PAGE_LIMIT = 50;
const TARGET_NODE_ID = 62;
const BASE_URL = 'https://www.democracycraft.net/api/threads';
const MAX_PAGES = 100;

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

  const monthIndex = monthMap[monthStr];
  if (monthIndex === undefined) return null;

  const parsed = new Date(parseInt(yearStr), monthIndex, parseInt(dayStr));
  parsed.setHours(0, 0, 0, 0);
  return parsed;
}

async function fetchAllThreads() {
  let page = 1;
  const allThreads = [];

  while (page <= MAX_PAGES) {
    const url = `${BASE_URL}?page=${page}&limit=${PAGE_LIMIT}`;
    console.log(`🔄 Fetching page ${page}: ${url}`);

    let res;
    let text;

    try {
      res = await fetch(url, {
        headers: { 'XF-Api-Key': API_KEY }
      });
      text = await res.text();
    } catch (err) {
      console.error(`❌ Network error on page ${page}:`, err.message);
      process.exit(1);
    }

    let errorJson = null;
    try {
      errorJson = JSON.parse(text);
    } catch (_) {
      // leave errorJson as null
    }

    // Gracefully handle invalid_page error
    if (
      res.status === 400 &&
      errorJson?.errors?.[0]?.code === "invalid_page"
    ) {
      const max = errorJson.errors[0].params?.max ?? page - 1;
      console.log(`✅ Reached last valid page (max page ${max})`);
      break;
    } else if (!res.ok) {
      console.error(`❌ HTTP ${res.status} - ${res.statusText}`);
      console.error(`URL: ${url}`);
      console.error(`Response: ${text}`);
      process.exit(1);
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error('❌ Failed to parse JSON:', text);
      process.exit(1);
    }

    const threads = data.threads;
    if (!Array.isArray(threads) || threads.length === 0) break;

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
    console.log(`✅ Saved ${minimalThreads.length} filtered threads to data.json`);
    process.exit(0); // Explicit success exit
  } catch (err) {
    console.error('❌ Script failed:', err.message);
    process.exit(1);
  }
})();
