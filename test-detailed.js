const https = require('https');

function test(url) {
  return new Promise((resolve) => {
    const u = new URL(url);
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname,
      method: 'GET',
      timeout: 20000
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({ 
          status: res.statusCode, 
          data: data,
          headers: res.headers
        });
      });
    });
    req.on('error', (err) => {
      resolve({ status: 0, error: err.message });
    });
    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 0, error: 'Timeout' });
    });
    req.end();
  });
}

async function run() {
  console.log('Testing endpoints with detailed output...\n');
  
  const endpoints = [
    { name: 'Root', url: 'https://mavencave-backend.vercel.app/' },
    { name: 'Health', url: 'https://mavencave-backend.vercel.app/api/health' },
    { name: 'Blogs', url: 'https://mavencave-backend.vercel.app/api/v1/blogs' },
  ];
  
  for (const ep of endpoints) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`Testing: ${ep.name}`);
    console.log(`URL: ${ep.url}`);
    console.log(`${'='.repeat(50)}`);
    
    const result = await test(ep.url);
    
    if (result.status === 0) {
      console.log(`❌ Error: ${result.error}`);
    } else {
      console.log(`Status: ${result.status}`);
      console.log(`Response: ${result.data.substring(0, 500)}`);
    }
  }
}

run();

