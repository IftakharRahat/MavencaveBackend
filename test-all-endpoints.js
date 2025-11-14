const https = require('https');

const BASE = 'https://mavencave-backend.vercel.app';

function test(path, method = 'GET') {
  return new Promise((resolve) => {
    const url = new URL(BASE + path);
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: method,
      timeout: 15000
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({ 
          status: res.statusCode, 
          ok: res.statusCode < 400,
          data: data.substring(0, 150)
        });
      });
    });
    
    req.on('error', (err) => resolve({ status: 0, ok: false, error: err.message }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, ok: false, error: 'Timeout' }); });
    req.end();
  });
}

async function run() {
  console.log('🔍 Testing All API Endpoints...\n');
  
  const tests = [
    { name: 'Root', path: '/' },
    { name: 'Health', path: '/api/health' },
    { name: 'Blogs', path: '/api/v1/blogs' },
    { name: 'Events', path: '/api/v1/events' },
    { name: 'Exams', path: '/api/v1/exams' },
    { name: 'About Us', path: '/api/v1/about-us' },
    { name: 'Banners', path: '/api/v1/banners' },
    { name: 'Questions', path: '/api/v1/questions/exam/test-id' },
  ];
  
  const results = { passed: 0, failed: 0 };
  
  for (const t of tests) {
    process.stdout.write(`Testing ${t.name.padEnd(12)}... `);
    const result = await test(t.path);
    if (result.ok) {
      console.log(`✅ ${result.status}`);
      results.passed++;
    } else if (result.status === 404) {
      console.log(`❌ 404 - Not Found`);
      results.failed++;
    } else if (result.status === 0) {
      console.log(`❌ ${result.error || 'Failed'}`);
      results.failed++;
    } else {
      console.log(`⚠️  ${result.status}`);
      results.passed++;
    }
  }
  
  console.log(`\n📊 Results: ${results.passed} passed, ${results.failed} failed`);
  console.log('✅ Test complete!');
}

run();

