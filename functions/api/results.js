export async function onRequest(context) {
  const gasUrl = context.env.GAS_URL;

  if (!gasUrl) {
    return jsonResponse(
      {
        title: 'S級リーグS1',
        updatedAt: new Date().toISOString(),
        summary: {
          headers: [],
          rows: []
        },
        days: [],
        error: 'GAS_URL is not set'
      },
      500
    );
  }

  try {
    const response = await fetch(gasUrl, {
      headers: {
        'User-Agent': 'Cloudflare Pages Function'
      }
    });

    if (!response.ok) {
      return jsonResponse(
        {
          title: 'S級リーグS1',
          updatedAt: new Date().toISOString(),
          summary: {
            headers: [],
            rows: []
          },
          days: [],
          error: `Apps Script error: ${response.status}`
        },
        502
      );
    }

    const data = await response.json();

    return jsonResponse(data, 200);
  } catch (error) {
    return jsonResponse(
      {
        title: 'S級リーグS1',
        updatedAt: new Date().toISOString(),
        summary: {
          headers: [],
          rows: []
        },
        days: [],
        error: String(error && error.message ? error.message : error)
      },
      500
    );
  }
}

function jsonResponse(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}
