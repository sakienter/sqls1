const DEMO_DATA = {
  title: 'CNvsWorld Demo Finals',
  updatedAt: '2026-06-10T12:00:00+09:00',
  games: ['game1', 'game2', 'game3', 'game4', 'game5', 'game6', 'game7', 'game8'],
  rows: [
    { name: 'JEEF', totalPt: 52, ptRank: '1st', placementRank: '2nd', isWinner: true, game1: 4.5, game2: 5.5, game3: 7, game4: 7, game5: 3.5, game6: 9, game7: 6.5, game8: 9, place1: '4th', place2: '3rd', place3: '2nd', place4: '2nd', place5: '5th', place6: '1st', place7: '2nd', place8: '1st' },
    { name: 'MATSURI', totalPt: 26, ptRank: '7th', placementRank: '5th', isWinner: false, game1: 1, game2: 9, game3: 4.5, game4: 4.5, game5: 3.5, game6: 1, game7: 1, game8: 1.5, place1: '8th', place2: '1st', place3: '4th', place4: '4th', place5: '5th', place6: '8th', place7: '8th', place8: '7th' },
    { name: 'Player A', totalPt: 48.5, ptRank: '2nd', placementRank: '1st', isWinner: false, game1: 7, game2: 3.5, game3: 9, game4: 5.5, game5: 9, game6: 5.5, game7: 4.5, game8: 4.5, place1: '2nd', place2: '5th', place3: '1st', place4: '3rd', place5: '1st', place6: '3rd', place7: '4th', place8: '4th' },
    { name: 'Player B', totalPt: 45, ptRank: '3rd', placementRank: '3rd', isWinner: false, game1: 9, game2: 1, game3: 5.5, game4: 9, game5: 5.5, game6: 3.5, game7: 9, game8: 2.5, place1: '1st', place2: '8th', place3: '3rd', place4: '1st', place5: '3rd', place6: '5th', place7: '1st', place8: '6th' },
    { name: 'Player C', totalPt: 39, ptRank: '4th', placementRank: '4th', isWinner: false, game1: 5.5, game2: 7, game3: 1, game4: 3.5, game5: 7, game6: 7, game7: 5.5, game8: 2.5, place1: '3rd', place2: '2nd', place3: '8th', place4: '5th', place5: '2nd', place6: '2nd', place7: '3rd', place8: '6th' }
  ]
};

async function loadData() {
  try {
    const response = await fetch('/api/results', { cache: 'no-store' });
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    const data = await response.json();
    return { data, source: 'Cloudflare Pages Function: /api/results' };
  } catch (apiError) {
    try {
      const response = await fetch('./sample-data.json', { cache: 'no-store' });
      if (!response.ok) throw new Error(`sample-data returned ${response.status}`);
      const data = await response.json();
      return { data, source: 'sample-data.json' };
    } catch (sampleError) {
      return { data: DEMO_DATA, source: 'embedded demo data' };
    }
  }
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('ja-JP', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
}

function getGames(data) {
  if (Array.isArray(data.games) && data.games.length > 0) return data.games;
  const first = data.rows?.[0] ?? {};
  return Object.keys(first).filter((key) => /^game\d+$/.test(key));
}

function buildHeader(table, firstColumns, games) {
  table.querySelector('thead').innerHTML = `
    <tr>
      ${firstColumns.map((label) => `<th>${escapeHtml(label)}</th>`).join('')}
      ${games.map((game) => `<th>${escapeHtml(game)}</th>`).join('')}
    </tr>
  `;
}

function pointClass(value) {
  const n = Number(value);
  if (Number.isFinite(n) && n >= 9) return 'top-cell';
  return '';
}

function placementClass(value) {
  return String(value).trim().toLowerCase() === '1st' ? 'top-cell' : '';
}

function renderPoints(data) {
  const table = document.querySelector('#points-table');
  const games = getGames(data);
  const rows = [...(data.rows ?? [])].sort((a, b) => Number(b.totalPt ?? 0) - Number(a.totalPt ?? 0));

  buildHeader(table, ['Name', 'Total Pt', 'Pt順位'], games);
  table.querySelector('tbody').innerHTML = rows.map((row) => `
    <tr class="${row.isWinner === true ? 'winner-row' : ''}">
      <td>${escapeHtml(row.name)}</td>
      <td>${escapeHtml(row.totalPt)}</td>
      <td>${escapeHtml(row.ptRank)}</td>
      ${games.map((game) => `<td class="${pointClass(row[game])}">${escapeHtml(row[game])}</td>`).join('')}
    </tr>
  `).join('');
}

function renderPlacements(data) {
  const table = document.querySelector('#placements-table');
  const games = getGames(data);
  const rows = [...(data.rows ?? [])].sort((a, b) => Number(b.totalPt ?? 0) - Number(a.totalPt ?? 0));

  buildHeader(table, ['Name', 'Total Pt', '順位'], games);
  table.querySelector('tbody').innerHTML = rows.map((row) => `
    <tr class="${row.isWinner === true ? 'winner-row' : ''}">
      <td>${escapeHtml(row.name)}</td>
      <td>${escapeHtml(row.totalPt)}</td>
      <td>${escapeHtml(row.placementRank ?? row.ptRank)}</td>
      ${games.map((game) => {
        const placementKey = game.replace('game', 'place');
        return `<td class="${placementClass(row[placementKey])}">${escapeHtml(row[placementKey])}</td>`;
      }).join('')}
    </tr>
  `).join('');
}

async function main() {
  const { data, source } = await loadData();

  document.querySelector('#event-title').textContent = data.title ?? 'CNvsWorld Result Demo';
  document.querySelector('#data-status').textContent = `Data: ${source}`;
  document.querySelector('#updated-at').textContent = data.updatedAt ? `Updated: ${formatDate(data.updatedAt)}` : '';

  renderPoints(data);
  renderPlacements(data);
}

main();
