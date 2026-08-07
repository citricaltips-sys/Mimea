const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const path = require('node:path');

let server;

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

test('server exposes health and outbreak endpoints', async () => {
  server = spawn(process.execPath, ['server.js'], {
    cwd: path.join(__dirname),
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let output = '';
  server.stdout.on('data', chunk => { output += chunk.toString(); });
  server.stderr.on('data', chunk => { output += chunk.toString(); });

  await wait(1200);

  const health = await fetch('http://127.0.0.1:3000/health');
  assert.equal(health.status, 200);
  const healthJson = await health.json();
  assert.equal(healthJson.ok, true);

  const post = await fetch('http://127.0.0.1:3000/api/outbreaks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      diseaseKey: 'tomato late blight',
      diseaseName: 'Tomato Late Blight',
      latitude: -1.2921,
      longitude: 36.8219,
      notes: 'Test report',
      source: 'community',
      syncStatus: 'synced',
      isOutbreak: true
    })
  });
  assert.equal(post.status, 201);

  const list = await fetch('http://127.0.0.1:3000/api/outbreaks');
  assert.equal(list.status, 200);
  const listData = await list.json();
  assert.ok(Array.isArray(listData));
  assert.ok(listData.some(item => item.notes === 'Test report'));

  server.kill('SIGTERM');
});
