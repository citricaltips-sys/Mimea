const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'outbreaks.json');
const DATA_DIR = path.dirname(DATA_FILE);

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
  }
}

function readOutbreaks() {
  ensureDataFile();
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function writeOutbreaks(items) {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2));
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS' });
  res.end(JSON.stringify(payload));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || '127.0.0.1'}`);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS' });
    res.end();
    return;
  }

  if (req.method === 'GET' && url.pathname === '/health') {
    sendJson(res, 200, { ok: true, service: 'mimeahub-server' });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/outbreaks') {
    sendJson(res, 200, readOutbreaks());
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/outbreaks') {
    try {
      const body = await parseBody(req);
      const record = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        diseaseKey: body.diseaseKey || body.disease_key || '',
        diseaseName: body.diseaseName || body.disease_name || '',
        cropType: body.cropType || body.crop_type || '',
        confidence: body.confidence || 0,
        latitude: body.latitude ?? null,
        longitude: body.longitude ?? null,
        notes: body.notes || '',
        timestamp: body.timestamp || new Date().toISOString(),
        source: body.source || 'community',
        syncStatus: body.syncStatus || body.sync_status || 'synced',
        isOutbreak: body.isOutbreak ?? body.is_outbreak ?? true
      };
      const items = readOutbreaks();
      items.unshift(record);
      writeOutbreaks(items);
      sendJson(res, 201, record);
    } catch (error) {
      sendJson(res, 400, { error: 'Invalid JSON body' });
    }
    return;
  }

  sendJson(res, 404, { error: 'Not found' });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`MimeaHub server running on http://127.0.0.1:${PORT}`);
});
