const DEMO_DATA = {
  title: 'CNvsWorld Demo Finals',
  updatedAt: new Date().toISOString(),
  games: ['game1', 'game2', 'game3', 'game4', 'game5', 'game6', 'game7', 'game8'],
  rows: [
    { name: 'JEEF', totalPt: 52, ptRank: '1st', placementRank: '2nd', isWinner: true, game1: 4.5, game2: 5.5, game3: 7, game4: 7, game5: 3.5, game6: 9, game7: 6.5, game8: 9, place1: '4th', place2: '3rd', place3: '2nd', place4: '2nd', place5: '5th', place6: '1st', place7: '2nd', place8: '1st' },
    { name: 'MATSURI', totalPt: 26, ptRank: '7th', placementRank: '5th', isWinner: false, game1: 1, game2: 9, game3: 4.5, game4: 4.5, game5: 3.5, game6: 1, game7: 1, game8: 1.5, place1: '8th', place2: '1st', place3: '4th', place4: '4th', place5: '5th', place6: '8th', place7: '8th', place8: '7th' }
  ]
};

export async function onRequestGet(context) {
  const gasUrl = context.env.GAS_URL;

  // GAS_URLを設定していない状態でもCloudflare Pages上で動作確認できるように、デモJSONを返します。
  if (!gasUrl) {
    return jsonResponse(DEMO_DATA, 60);
  }

  const response = await fetch(gasUrl, {
    headers: {
      'accept': 'application/json'
    }
  });

  if (!response.ok) {
    return jsonResponse({
      error: 'Failed to fetch GAS_URL',
      status: response.status
    }, 0, 502);
  }

  const text = await response.text();

  return new Response(text, {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=60'
    }
  });
}

function jsonResponse(value, maxAge = 60, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': `public, max-age=${maxAge}`
    }
  });
}
