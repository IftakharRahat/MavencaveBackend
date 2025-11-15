const http = require('http');
const https = require('https');

// Configuration
const BASE_URL = process.env.API_URL || 'https://mavencavebackend.onrender.com';
const API_BASE = `${BASE_URL}/api/v1`;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Test results storage
const results = {
  passed: [],
  failed: [],
  skipped: [],
};

// Helper function to make HTTP requests
function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    // Ensure path starts with / and construct full URL
    const fullPath = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(API_BASE + fullPath);
    const isHttps = url.protocol === 'https:';
    const requestModule = isHttps ? https : http;
    const options = {
      method,
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = requestModule.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: parsed,
            rawBody: body,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body,
            rawBody: body,
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Test function
async function testEndpoint(name, method, path, expectedStatus = 200, data = null, token = null, skip = false) {
  if (skip) {
    results.skipped.push({ name, method, path, reason: 'Skipped' });
    console.log(`${colors.yellow}⏭ SKIP${colors.reset} ${method} ${path} - ${name}`);
    return;
  }

  try {
    const response = await makeRequest(method, path, data, token);
    const isSuccess = response.status === expectedStatus || (expectedStatus === 'any' && response.status < 500);
    
    if (isSuccess) {
      results.passed.push({ name, method, path, status: response.status });
      console.log(`${colors.green}✓ PASS${colors.reset} ${method} ${path} - ${name} (${response.status})`);
    } else {
      results.failed.push({ name, method, path, expected: expectedStatus, actual: response.status, error: response.body });
      console.log(`${colors.red}✗ FAIL${colors.reset} ${method} ${path} - ${name} (Expected: ${expectedStatus}, Got: ${response.status})`);
    }
  } catch (error) {
    results.failed.push({ name, method, path, error: error.message });
    console.log(`${colors.red}✗ FAIL${colors.reset} ${method} ${path} - ${name} (Error: ${error.message})`);
  }
}

// Main test function
async function runTests() {
  console.log(`${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}  API Endpoint Testing${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}\n`);
  console.log(`Testing against: ${BASE_URL}\n`);

  // Test root endpoint
  try {
    const rootUrl = new URL(BASE_URL);
    const isHttps = rootUrl.protocol === 'https:';
    const requestModule = isHttps ? https : http;
    const rootOptions = {
      method: 'GET',
      hostname: rootUrl.hostname,
      port: rootUrl.port || (isHttps ? 443 : 80),
      path: rootUrl.pathname || '/',
    };
    const rootResponse = await new Promise((resolve, reject) => {
      const req = requestModule.request(rootOptions, (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => resolve({ status: res.statusCode, body }));
      });
      req.on('error', reject);
      req.end();
    });
    if (rootResponse.status === 200) {
      console.log(`${colors.green}✓ Server is running${colors.reset}\n`);
    } else {
      console.log(`${colors.red}✗ Server returned status ${rootResponse.status}${colors.reset}\n`);
    }
  } catch (error) {
    console.log(`${colors.red}✗ Cannot connect to server: ${error.message}${colors.reset}`);
    console.log(`${colors.yellow}Make sure the server is running on ${BASE_URL}${colors.reset}\n`);
    return;
  }

  console.log(`${colors.blue}Testing Public Endpoints...${colors.reset}\n`);

  // Auth Routes (Public)
  await testEndpoint('Register User', 'POST', '/auth/register', 201, {
    name: 'Test User',
    email: 'test@example.com',
    password: 'Test123!@#',
  });
  await testEndpoint('Login User', 'POST', '/auth/login', 'any', {
    email: 'test@example.com',
    password: 'Test123!@#',
  });

  // Course Routes (Public)
  await testEndpoint('Get Course Details', 'GET', '/courses/test-course-id', 'any');

  // Blog Routes (Public)
  await testEndpoint('Get All Blogs', 'GET', '/blogs', 200);
  await testEndpoint('Get Blog By ID', 'GET', '/blogs/test-id', 'any');

  // Event Routes (Public)
  await testEndpoint('Get All Events', 'GET', '/events', 200);
  await testEndpoint('Get Event By ID', 'GET', '/events/test-id', 'any');

  // Exam Routes (Public)
  await testEndpoint('List Exams', 'GET', '/exams', 200);
  await testEndpoint('Get Exam', 'GET', '/exams/test-exam-id', 'any');

  // Question Routes (Public)
  await testEndpoint('Get Questions For Exam', 'GET', '/questions/exam/test-exam-id', 'any');

  // About Us Routes (Public)
  await testEndpoint('Get About Us', 'GET', '/about-us', 'any');

  // Ad Banner Routes (assuming public GET)
  await testEndpoint('Get Ad Banners', 'GET', '/banners', 'any');

  console.log(`\n${colors.blue}Testing Protected Endpoints (without auth - should fail with 401)...${colors.reset}\n`);

  // Protected endpoints (should return 401 without auth)
  await testEndpoint('Get Me (Protected)', 'GET', '/auth/me', 401);
  await testEndpoint('Create Course (Protected)', 'POST', '/courses', 401);
  await testEndpoint('Create Blog (Protected)', 'POST', '/blogs', 401);
  await testEndpoint('Create Event (Protected)', 'POST', '/events', 401);
  await testEndpoint('Create Exam (Protected)', 'POST', '/exams', 401);
  await testEndpoint('Start Session (Protected)', 'POST', '/sessions/start', 401);
  await testEndpoint('Get Chat Sessions (Protected)', 'GET', '/chat/sessions', 401);
  await testEndpoint('Create Event Booking (Protected)', 'POST', '/event-bookings', 401);
  await testEndpoint('Get Admin Panel Data (Protected)', 'GET', '/admin-panel', 401);

  // Print summary
  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}  Test Summary${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.green}Passed: ${results.passed.length}${colors.reset}`);
  console.log(`${colors.red}Failed: ${results.failed.length}${colors.reset}`);
  console.log(`${colors.yellow}Skipped: ${results.skipped.length}${colors.reset}`);

  if (results.failed.length > 0) {
    console.log(`\n${colors.red}Failed Tests:${colors.reset}`);
    results.failed.forEach((test) => {
      console.log(`  - ${test.method} ${test.path} - ${test.name}`);
      if (test.error) {
        console.log(`    Error: ${typeof test.error === 'string' ? test.error : JSON.stringify(test.error)}`);
      }
      if (test.expected && test.actual) {
        console.log(`    Expected: ${test.expected}, Got: ${test.actual}`);
      }
    });
  }

  console.log(`\n${colors.cyan}========================================${colors.reset}\n`);

  // Exit with appropriate code
  process.exit(results.failed.length > 0 ? 1 : 0);
}

// Run tests
runTests().catch((error) => {
  console.error(`${colors.red}Test runner error: ${error.message}${colors.reset}`);
  process.exit(1);
});

