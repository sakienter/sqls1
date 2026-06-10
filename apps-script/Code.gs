const SHEET_NAME = 'public_data';

function doGet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return jsonOutput({
      title: 'Result Page',
      updatedAt: new Date().toISOString(),
      games: [],
      rows: []
    });
  }

  const headers = values[0].map(String);
  const rows = values.slice(1)
    .filter(row => row[0] !== '')
    .map(row => {
      const obj = {};
      headers.forEach((key, index) => {
        obj[key] = row[index];
      });
      return obj;
    });

  const games = headers.filter(key => /^game\d+$/.test(key));

  return jsonOutput({
    title: 'CNvsWorld Results',
    updatedAt: new Date().toISOString(),
    games,
    rows
  });
}

function jsonOutput(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
