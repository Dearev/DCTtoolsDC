const API_URL = 'https://cors-anywhere.herokuapp.com/https://www.democracycraft.net/api/threads';
const TARGET_NODE_ID = 62;
const PAGE_LIMIT = 50;
// TEST
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

function extractPlotCode(title) {
  const parts = title.split('|');
  if (parts.length < 2) return 'UNKNOWN';

  const plot = parts[0].trim();
  return plot || 'UNKNOWN';
}

function getStartPage() {
  const params = new URLSearchParams(window.location.search);
  return parseInt(params.get('startPage')) || 1;
}

async function fetchPendingReports() {
  const allThreads = [];
  let page = getStartPage();

  try {
    while (true) {
      const response = await fetch(`${API_URL}?page=${page}&limit=${PAGE_LIMIT}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} – ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.threads || data.threads.length === 0) break;

      console.log(`📄 Page ${page}: ${data.threads.length} threads`);
      allThreads.push(...data.threads);

      if (data.threads.length < PAGE_LIMIT) break; // last page reached
      page++;
    }

    return allThreads
      .filter(t => t.node_id === TARGET_NODE_ID)
      .filter(t => {
        if (t.prefix_id === 130) return true;
        if (t.prefix_id === 5) {
          const date = extractDateFromTitle(t.title);
          return date && date <= today;
        }
        return false;
      });

  } catch (err) {
    console.error('❌ Fetch failed:', err);
    throw err;
  }
}

function createReportCard(thread) {
  const plot = extractPlotCode(thread.title);

  const card = document.createElement('div');
  card.className = 'report-card';

  const title = document.createElement('div');
  title.className = 'report-title';
  title.textContent = `#${thread.thread_id} – ${thread.title}`;

  const buttons = document.createElement('div');
  buttons.className = 'button-row';

  const goButton = document.createElement('button');
  goButton.className = 'btn';
  goButton.textContent = 'Go to Report';
  goButton.onclick = () => window.open(thread.view_url, '_blank');

  const copyButton = document.createElement('button');
  copyButton.className = 'btn';
  copyButton.textContent = 'Copy Eviction Cmd';
  copyButton.onclick = () => {
    const command = `/dct-setplotowner govdevelop ${plot}`;
    navigator.clipboard.writeText(command).then(() => {
      copyButton.textContent = 'Copied!';
      setTimeout(() => (copyButton.textContent = 'Copy Eviction Cmd'), 1500);
    });
  };

  buttons.appendChild(goButton);
  buttons.appendChild(copyButton);
  card.appendChild(title);
  card.appendChild(buttons);

  return card;
}

async function init() {
  const container = document.getElementById('report-list');
  container.textContent = 'Loading...';

  try {
    const reports = await fetchPendingReports();
    container.innerHTML = '';

    if (reports.length === 0) {
      container.textContent = 'No pending reports found.';
      return;
    }

    reports.forEach(thread => {
      container.appendChild(createReportCard(thread));
    });
  } catch (err) {
    container.innerHTML = `
      <div style="color: #f88;">
        ⚠️ Failed to load reports:<br><br>
        <code>${err.message}</code>
      </div>
    `;
  }
}

init();




