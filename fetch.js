const fs = require('fs');
const fetch = require('node-fetch');

const API_KEY = process.env.API_KEY;
const PAGE_LIMIT = 50;
const TARGET_NODE_ID = 62;
const BASE_URL = 'https://www.democracycraft.net/api/threads';

const today = new Date();
today.setHours(0, 0, 0, 0);

// extract date from thread title
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

// get all threads across pages
async function fetchAllThreads() {
  let page = 1;
  const allThreads = [];

  while (true) {
    const res = await fetch(`${BASE_URL}?page=${page}&limit=${PAGE_LIMIT}`, {
      headers: { 'XF-Api-Key': API_KEY }
    });

    if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);

    const data = await res.json();
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

    // shrink output: only keep needed fields
    const minimalThreads = filtered.map(t => ({
      thread_id: t.thread_id,
      title: t.title,
      prefix_id: t.prefix_id,
      view_url: t.view_url
    }));

    fs.writeFileSync('data.json', JSON.stringify({ threads: minimalThreads }));
    console.log(`✅ Saved ${minimalThreads.length} filtered threads`);
  } catch (err) {
    console.error('❌ Fetch failed:', err);
    process.exit(1);
  }
})();

