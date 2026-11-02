/**
 * ==============================================================================
 * AUTOMATED IN-MEMORY INTEGRATION TEST SUITE (test_runner.js)
 * Tests all routes, APIs, headers, security, demo mode, and CORS restrictions.
 * ==============================================================================
 */

const { Readable, Writable } = require("node:stream");
const { handleRequest } = require("./server.js");

const DEMO_TOKEN = "launchflow-demo-session-token-v1";

class MockRequest extends Readable {
  constructor(method, url, headers = {}, body = "") {
    super();
    this.method = method;
    this.url = url;
    this.headers = {};
    for (let k in headers) {
      this.headers[k.toLowerCase()] = headers[k];
    }
    this.socket = { remoteAddress: "127.0.0.1" };
    if (body) {
      this.push(typeof body === "string" ? body : JSON.stringify(body));
    }
    this.push(null);
  }
}

class MockResponse extends Writable {
  constructor() {
    super();
    this.statusCode = 200;
    this.headers = {};
    this.body = "";
    this._ended = false;
    this._callbacks = [];
  }

  setHeader(k, v) {
    this.headers[k.toLowerCase()] = v;
  }

  getHeader(k) {
    return this.headers[k.toLowerCase()];
  }

  writeHead(statusCode, headers = {}) {
    this.statusCode = statusCode;
    for (let k in headers) {
      this.headers[k.toLowerCase()] = headers[k];
    }
  }

  _write(chunk, encoding, callback) {
    this.body += chunk.toString();
    callback();
  }

  end(data) {
    if (data) {
      this.body += data.toString();
    }
    this._ended = true;
    this.emit("finish");
    this._callbacks.forEach((cb) => cb());
  }

  onFinish() {
    return new Promise((resolve) => {
      if (this._ended) return resolve();
      this._callbacks.push(resolve);
      this.on("finish", resolve);
    });
  }
}

async function testRoute(method, url, headers = {}, body = "") {
  const req = new MockRequest(method, url, headers, body);
  const res = new MockResponse();
  handleRequest(req, res);
  await res.onFinish();
  return {
    statusCode: res.statusCode,
    headers: res.headers,
    body: res.body,
  };
}

let passedCount = 0;
let failedCount = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedCount++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failedCount++;
  }
}

async function runAllTests() {
  console.log("\n🧪 STARTING NODE IN-MEMORY INTEGRATION TESTS...\n");

  try {
    // 1. Homepage & Security Headers
    const home = await testRoute("GET", "/");
    assert(home.statusCode === 200, "Homepage returns HTTP 200");
    assert(home.body.includes("<!DOCTYPE html>"), "Homepage contains HTML5 doctype");
    assert(home.body.includes('name="viewport"'), "Homepage has mobile responsive viewport tag");
    assert(home.headers["x-content-type-options"] === "nosniff", "Security header X-Content-Type-Options: nosniff present");
    assert(home.headers["x-frame-options"] === "DENY", "Security header X-Frame-Options: DENY present");
    assert(home.headers["strict-transport-security"] && home.headers["strict-transport-security"].includes("max-age=31536000"), "HSTS (Strict-Transport-Security) header is active");

    // 2. Clean Routing on All HTML Pages
    const pages = ["/about", "/contact", "/privacy", "/terms", "/app"];
    for (const p of pages) {
      const res = await testRoute("GET", p);
      assert(res.statusCode === 200, `Clean URL route '${p}' resolves with HTTP 200`);
      assert(res.body.includes("site.config.js"), `Page '${p}' includes site.config.js`);
    }

    // 3. Custom 404 Error Handling
    const missing = await testRoute("GET", "/non-existent-page-xyz");
    assert(missing.statusCode === 404, "Non-existent URL returns HTTP 404");
    assert(missing.body.includes("404"), "Custom 404 page content is delivered");

    // 4. Static CSS Stylesheet
    const css = await testRoute("GET", "/public/css/style.css");
    assert(css.statusCode === 200, "Stylesheet /public/css/style.css returns HTTP 200");
    assert(css.body.includes("@media (max-width:"), "CSS stylesheet contains responsive media queries");
    assert(css.body.includes("--color-primary:"), "CSS stylesheet defines theme CSS variables");

    // 5. Favicon
    const fav = await testRoute("GET", "/public/favicon.svg");
    assert(fav.statusCode === 200, "Favicon returns HTTP 200");
    assert(fav.headers["content-type"].includes("image/svg+xml"), "Favicon MIME type is image/svg+xml");

    // 6. API: Health Check
    const health = await testRoute("GET", "/api/health");
    assert(health.statusCode === 200, "Health API /api/health returns HTTP 200");
    const healthData = JSON.parse(health.body);
    assert(healthData.status === "healthy", "Health API reports status 'healthy'");
    assert(!health.headers["access-control-allow-origin"], "Health API omits unrestricted wildcard CORS by default");

    // 7. API: Authentication Endpoint (Demo Security Fix Verification)
    const unauth = await testRoute("GET", "/api/auth");
    assert(unauth.statusCode === 401, "Auth API rejects unauthenticated call with HTTP 401");

    // Insecure token test: Long arbitrary strings must be rejected (Fixed issue 2)
    const arbitraryToken = await testRoute("GET", "/api/auth", { Authorization: "Bearer some-arbitrary-long-fake-token" });
    assert(arbitraryToken.statusCode === 401, "Auth API rejects arbitrary long string token with HTTP 401");

    // Insecure token test: Tokens starting with 'usr_' must be rejected (Fixed issue 2)
    const usrToken = await testRoute("GET", "/api/auth", { Authorization: "Bearer usr_spoofed_admin" });
    assert(usrToken.statusCode === 401, "Auth API rejects spoofed 'usr_' token with HTTP 401");

    // Valid demo token test
    const validDemoAuth = await testRoute("GET", "/api/auth", { Authorization: `Bearer ${DEMO_TOKEN}` });
    assert(validDemoAuth.statusCode === 200, "Auth API accepts exact demo token with HTTP 200");
    const authData = JSON.parse(validDemoAuth.body);
    assert(authData.authenticated === true, "Auth API reports authenticated: true for demo token");
    assert(authData.isDemo === true, "Auth API explicitly labels response as isDemo: true");
    assert(authData.warning && authData.warning.includes("DEMO MODE"), "Auth API returns clear demo warning banner");
    assert(!validDemoAuth.headers["access-control-allow-origin"], "Auth API omits unrestricted wildcard CORS header");

    // 8. API: Contact Form Validation & Honest Submission (Fixed issue 4)
    const badContact = await testRoute("POST", "/api/contact", { "Content-Type": "application/json" }, {
      name: "A",
      email: "invalid-email",
      message: "short",
    });
    assert(badContact.statusCode === 400, "Contact API rejects invalid name and email with HTTP 400");

    const goodContact = await testRoute("POST", "/api/contact", { "Content-Type": "application/json" }, {
      name: "Sarah Miller",
      email: "sarah@growthcorp.com",
      subject: "Partnership",
      message: "We would like to discuss licensing your web application starter for our team.",
    });
    assert(goodContact.statusCode === 200, "Contact API accepts valid submission with HTTP 200");
    const goodData = JSON.parse(goodContact.body);
    assert(goodData.success === true, "Contact API returns success: true");
    assert(goodData.deliveredToEmail === false, "Contact API honestly reports deliveredToEmail: false when email provider not configured");
    assert(goodData.demoMode === true, "Contact API returns demoMode: true");
    assert(!goodContact.headers["access-control-allow-origin"], "Contact API omits unrestricted wildcard CORS header");

    // 9. API: Honeypot Anti-Bot Trap
    const botContact = await testRoute("POST", "/api/contact", { "Content-Type": "application/json" }, {
      name: "SpamBot",
      email: "bot@spammer.com",
      message: "Buy cheap backlinks now from this link",
      honeypot: "http://spamurl.com",
    });
    assert(botContact.statusCode === 200, "Honeypot trap absorbs spam bot with HTTP 200 drop");

    // 10. API: Ephemeral Demo Data Store (Fixed issue 3)
    const dataGet = await testRoute("GET", "/api/data");
    assert(dataGet.statusCode === 200, "Data API /api/data returns HTTP 200 on GET");
    const dataItems = JSON.parse(dataGet.body);
    assert(dataItems.isDemoStore === true, "Data API clearly labels store as isDemoStore: true");
    assert(dataItems.storageType === "ephemeral-in-memory", "Data API explicitly declares storageType: 'ephemeral-in-memory'");
    assert(dataItems.warning && dataItems.warning.includes("DEMO DATA STORE"), "Data API returns clear persistence disclaimer");
    assert(Array.isArray(dataItems.items), "Data API returns array of items");
    assert(!dataGet.headers["access-control-allow-origin"], "Data API omits unrestricted wildcard CORS header");

    const dataPost = await testRoute("POST", "/api/data", { "Content-Type": "application/json" }, {
      title: "New Automated Test Task",
      status: "Active",
    });
    assert(dataPost.statusCode === 201, "Data API creates record with HTTP 201");
    const postData = JSON.parse(dataPost.body);
    assert(postData.isDemoStore === true, "Data POST response confirms isDemoStore: true");

    console.log("\n==================================================");
    console.log(`🏁 NODE IN-MEMORY TEST RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
    console.log("==================================================\n");

    if (failedCount > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error("Test error:", err);
    process.exit(1);
  }
}

runAllTests();
