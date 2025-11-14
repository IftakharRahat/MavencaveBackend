const https = require('https');

function test(url) {
  return new Promise((resolve) => {
    const u = new URL(url);
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname,
      method: 'GET',
      timeout: 30000
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Response: ${data.substring(0, 200)}`);
        resolve();
      });
    });
    req.on('error', (err) => {
      console.log(`Error: ${err.message}`);
      resolve();
    });
    req.on('timeout', () => {
      console.log('Timeout after 30s');
      req.destroy();
      resolve();
    });
    req.end();
  });
}

test('https://mavencave-backend.vercel.app/api/v1/blogs').then(() => {
  console.log('\nTest complete');
});

