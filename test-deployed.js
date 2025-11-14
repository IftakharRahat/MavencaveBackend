const https = require('https');

const BASE = 'https://mavencave-backend.vercel.app';

function test(path) {
  return new Promise((resolve) => {
    const url = new URL(BASE + path);
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'GET',
      timeout: 20000
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({ 
          status: res.statusCode, 
          ok: res.statusCode < 400,
          data: data.substring(0, 100)
        });
      });
    });
    
    req.on('error', (err) => resolve({ status: 0, ok: false, error: err.message }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, ok: false, error: 'Timeout' }); });
    req.end();
  });
}

async function run() {
  console.log('🔍 Testing Deployed API...\n');
  
  const tests = [
    { name: 'Root', path: '/' },
    { name: 'Blogs', path: '/api/v1/blogs' },
    { name: 'Events', path: '/api/v1/events' },
  ];
  
  for (const t of tests) {
    process.stdout.write(`Testing ${t.name}... `);
    const result = await test(t.path);
    if (result.ok) {
      console.log(`✅ ${result.status} - Working!`);
    } else if (result.status === 404) {
      console.log(`❌ 404 - Not Found`);
    } else if (result.status === 0) {
      console.log(`❌ ${result.error || 'Failed'}`);
    } else {
      console.log(`⚠️  ${result.status}`);
    }
  }
  
  console.log('\n✅ Test complete!');
}

run();

