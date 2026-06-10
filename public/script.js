const API_URL = '/api/results';

let loadedData = null;
let selectedDayIndex = 0;

const elements = {
  eventTitle: document.getElementById('event-title'),
  dataStatus: document.getElementById('data-status'),
  updatedAt: document.getElementById('updated-at'),

  summaryTable: document.getElementById('summary-table'),
  dayTabs: document.getElementById('day-tabs'),
  dayTitle: document.getElementById('day-title'),

  dailyScoreTable: document.getElementById('daily-score-table'),
  dayPointsTable: document.getElementById('day-points-table'),
  dayPlacementsTable: document.getElementById('day-placements-table')
};

init();

async function init() {
  try {
    setStatus('読み込み中...');

    const response = await fetch(API_URL, {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    loadedData = data;

    renderPage(data);
    setStatus('読み込み完了');
  } catch (error) {
    console.error(error);
    setStatus('読み込みに失敗しました');

    renderError(error);
  }
}

function renderPage(data) {
  if (data.title && elements.eventTitle) {
    elements.eventTitle.textContent = data.title;
    document.title = data.title;
  }

  if (elements.updatedAt && data.updatedAt) {
    elements.updatedAt.textContent = `更新: ${formatDateTime(data.updatedAt)}`;
  }

  renderSummary(data.summary);
  renderDayTabs(data.days || []);

  if (data.days && data.days.length > 0) {
    renderSelectedDay(0);
  }
}

function renderSummary(summary) {
  const columns = [
    { label: 'Name', key: 'name', className: 'name-cell' },
    { label: 'Point', key: 'point', className: 'number-cell' },
    { label: '順位', key: 'rank', className: 'rank-cell' }
  ];

  renderObjectTable(elements.summaryTable, columns, summary?.rows || [], {
    winnerByRank: true
  });
}

function renderDayTabs(days) {
  if (!elements.dayTabs) return;

  elements.dayTabs.innerHTML = '';

  days.forEach((day, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'day-tab';
    button.dataset.index = String(index);

    if (index === selectedDayIndex) {
      button.classList.add('active');
    }

    button.innerHTML = `
      <span class="day-tab-label">${escapeHtml(day.label || `DAY${index + 1}`)}</span>
      <span class="day-tab-date">${escapeHtml(day.date || '')}</span>
    `;

    button.addEventListener('click', () => {
      renderSelectedDay(index);
    });

    elements.dayTabs.appendChild(button);
  });
}

function renderSelectedDay(index) {
  if (!loadedData || !loadedData.days || !loadedData.days[index]) return;

  selectedDayIndex = index;

  const day = loadedData.days[index];

  updateActiveDayTab();

  if (elements.dayTitle) {
    const label = day.label || `DAY${index + 1}`;
    const date = day.date ? ` / ${day.date}` : '';
    elements.dayTitle.textContent = `${label}${date}`;
  }

  renderDailyScore(day);
  renderDayPoints(day);
  renderDayPlacements(day);
}

function updateActiveDayTab() {
  if (!elements.dayTabs) return;

  const buttons = elements.dayTabs.querySelectorAll('.day-tab');

  buttons.forEach((button, index) => {
    button.classList.toggle('active', index === selectedDayIndex);
  });
}

function renderDailyScore(day) {
  const columns = [
    { label: 'Name', key: 'name', className: 'name-cell' },
    { label: 'Point', key: 'point', className: 'number-cell' },
    { label: '順位', key: 'rank', className: 'rank-cell' }
  ];

  renderObjectTable(elements.dailyScoreTable, columns, day.dailyScore?.rows || [], {
    winnerByRank: true
  });
}

function renderDayPoints(day) {
  const games = day.games || [];

  const columns = [
    { label: 'Name', key: 'name', className: 'name-cell' },
    { label: 'Daily Total', key: 'dailyTotal', className: 'number-cell total-cell' },
    { label: '順位', key: 'rank', className: 'rank-cell' },
    ...games.map(game => ({
      label: game,
      key: game,
      className: 'number-cell game-cell'
    }))
  ];

  renderObjectTable(elements.dayPointsTable, columns, day.points?.rows || [], {
    winnerByRank: true
  });
}

function renderDayPlacements(day) {
  const games = day.games || [];

  const columns = [
    { label: 'Name', key: 'name', className: 'name-cell' },
    { label: '1st count', key: 'firstCount', className: 'number-cell' },
    { label: 'average', key: 'average', className: 'number-cell' },
    ...games.map(game => ({
      label: game,
      key: game,
      className: 'number-cell game-cell'
    }))
  ];

  renderObjectTable(elements.dayPlacementsTable, columns, day.placements?.rows || [], {});
}

function renderObjectTable(table, columns, rows, options = {}) {
  if (!table) return;

  const thead = table.querySelector('thead');
  const tbody = table.querySelector('tbody');

  if (!thead || !tbody) return;

  thead.innerHTML = '';
  tbody.innerHTML = '';

  const headerRow = document.createElement('tr');

  columns.forEach(column => {
    const th = document.createElement('th');
    th.textContent = column.label;
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);

  if (!rows || rows.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');

    td.colSpan = columns.length;
    td.className = 'empty-cell';
    td.textContent = 'データがありません';

    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

  rows.forEach(row => {
    const tr = document.createElement('tr');

    if (options.winnerByRank && isFirstRank(row.rank)) {
      tr.classList.add('winner-row');
    }

    columns.forEach(column => {
      const td = document.createElement('td');
      td.className = column.className || '';

      const value = row[column.key];

      td.textContent = formatCellValue(value);

      if (isFirstRank(value)) {
        td.classList.add('first-rank-cell');
      }

      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });
}

function renderError(error) {
  const message = error && error.message ? error.message : String(error);

  const tables = [
    elements.summaryTable,
    elements.dailyScoreTable,
    elements.dayPointsTable,
    elements.dayPlacementsTable
  ];

  tables.forEach(table => {
    if (!table) return;

    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');

    if (!thead || !tbody) return;

    thead.innerHTML = '';
    tbody.innerHTML = `
      <tr>
        <td class="empty-cell">エラー: ${escapeHtml(message)}</td>
      </tr>
    `;
  });
}

function setStatus(text) {
  if (elements.dataStatus) {
    elements.dataStatus.textContent = text;
  }
}

function formatCellValue(value) {
  if (value === null || value === undefined) return '';

  if (typeof value === 'number') {
    if (Number.isInteger(value)) return String(value);
    return String(Math.round(value * 100) / 100);
  }

  return String(value);
}

function formatDateTime(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function isFirstRank(value) {
  return String(value).trim().toLowerCase() === '1st';
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
