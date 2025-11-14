const https = require('https');

const BASE_URL = 'https://mavencave-backend.vercel.app';
const endpoints = [
  { name: 'Root', path: '/' },
  { name: 'Blogs', path: '/api/v1/blogs' },
  { name: 'Events', path: '/api/v1/events' },
  { name: 'Exams', path: '/api/v1/exams' },
  { name: 'About Us', path: '/api/v1/about-us' },
  { name: 'Banners', path: '/api/v1/banners' },
];

function test(url) {
  return new Promise((resolve) => {
    const req = https.get(url, (res) => {
      resolve({ status: res.statusCode, ok: res.statusCode < 400 });
    });
    req.on('error', () => resolve({ status: 0, ok: false }));
    req.setTimeout(30000, () => { req.destroy(); resolve({ status: 0, ok: false }); });
  });
}

async function run() {
  console.log('Testing API endpoints...\n');
  for (const ep of endpoints) {
    const url = BASE_URL + ep.path;
    const result = await test(url);
    const icon = result.ok ? '✓' : '✗';
    const status = result.status || 'TIMEOUT';
    console.log(`${icon} ${ep.name.padEnd(12)} ${status} ${ep.path}`);
  }
  console.log('\nDone!');
}

run();

