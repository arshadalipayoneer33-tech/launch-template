/**
 * ==============================================================================
 * ZERO-DEPENDENCY LOCAL DEVELOPMENT SERVER (server.js)
 * Uses standard Node.js built-in modules (http, fs, path).
 * Emulates Cloudflare Pages static file serving and serverless edge functions.
 * ==============================================================================
 */

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;

// In-memory rate limiting map for local testing
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;

// In-memory items store for local CRUD testing
const inMemoryItems = [
  { id: "1", title: "Launch MVP on Cloudflare Pages", status: "Completed", date: "Today" },
  { id: "2", title: "Validate first $100 service offer", status: "In Progress", date: "Tomorrow" },
];

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
};

// Export request handler and server instance
function handleRequest(req, res) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  let pathname = parsedUrl.pathname;

  // Add default security headers for local dev testing
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // ============================================================================
  // 1. API ROUTES (Emulates Cloudflare Pages Functions)
  // ============================================================================

  // Route: /api/health
  if (pathname === "/api/health" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(
      JSON.stringify({
        status: "healthy",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        environment: "local-node-dev",
      })
    );
  }

  // Route: /api/auth
  if (pathname === "/api/auth" && req.method === "GET") {
    const authHeader = req.headers["authorization"];
    res.setHeader("Content-Type", "application/json");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.writeHead(401);
      return res.end(JSON.stringify({ authenticated: false, error: "Missing Bearer token." }));
    }

    const token = authHeader.split(" ")[1];
    if (token === "demo-token" || token.startsWith("usr_")) {
      res.writeHead(200);
      return res.end(
        JSON.stringify({
          authenticated: true,
          user: { id: "usr_local", email: "founder@example.com", role: "admin" },
        })
      );
    }

    res.writeHead(403);
    return res.end(JSON.stringify({ authenticated: false, error: "Invalid token." }));
  }

  // Route: /api/contact
  if (pathname === "/api/contact") {
    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      });
      return res.end();
    }

    if (req.method === "POST") {
      res.setHeader("Content-Type", "application/json");

      // Rate limit check
      const clientIp = (req.socket && req.socket.remoteAddress) || "127.0.0.1";
      const now = Date.now();
      const userRequests = (rateLimitMap.get(clientIp) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

      if (userRequests.length >= MAX_REQUESTS) {
        res.writeHead(429);
        return res.end(
          JSON.stringify({
            success: false,
            error: "Too many messages sent. Please wait 10 minutes before trying again.",
          })
        );
      }

      let rawBody = "";
      req.on("data", (chunk) => {
        rawBody += chunk;
        if (rawBody.length > 1e6) req.destroy(); // Protect against payload flood
      });

      req.on("end", () => {
        try {
          const body = JSON.parse(rawBody || "{}");
          const { name, email, subject, message, honeypot } = body;

          // Honeypot bot trap
          if (honeypot && honeypot.trim().length > 0) {
            res.writeHead(200);
            return res.end(JSON.stringify({ success: true, message: "Thank you for your message." }));
          }

          // Validation
          if (!name || name.trim().length < 2) {
            res.writeHead(400);
            return res.end(JSON.stringify({ success: false, error: "Name must be at least 2 characters." }));
          }

          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!email || !emailRegex.test(email)) {
            res.writeHead(400);
            return res.end(JSON.stringify({ success: false, error: "A valid email address is required." }));
          }

          if (!message || message.trim().length < 10) {
            res.writeHead(400);
            return res.end(JSON.stringify({ success: false, error: "Message must be at least 10 characters." }));
          }

          // Record rate limit hit
          userRequests.push(now);
          rateLimitMap.set(clientIp, userRequests);

          console.log(`[Contact] Message received from ${name} <${email}>`);
          res.writeHead(200);
          return res.end(
            JSON.stringify({
              success: true,
              message: "Thank you! Your message has been received securely.",
            })
          );
        } catch (err) {
          res.writeHead(400);
          return res.end(JSON.stringify({ success: false, error: "Invalid JSON format." }));
        }
      });
      return;
    }
  }

  // Route: /api/data (CRUD testing)
  if (pathname === "/api/data") {
    res.setHeader("Content-Type", "application/json");

    if (req.method === "GET") {
      res.writeHead(200);
      return res.end(JSON.stringify({ success: true, items: inMemoryItems }));
    }

    if (req.method === "POST") {
      let raw = "";
      req.on("data", (c) => (raw += c));
      req.on("end", () => {
        try {
          const b = JSON.parse(raw || "{}");
          const item = {
            id: "item_" + Date.now(),
            title: String(b.title || "Untitled").replace(/[<>]/g, ""),
            status: b.status || "Active",
            date: new Date().toLocaleDateString(),
          };
          inMemoryItems.unshift(item);
          res.writeHead(201);
          return res.end(JSON.stringify({ success: true, item }));
        } catch (e) {
          res.writeHead(400);
          return res.end(JSON.stringify({ success: false, error: "Bad JSON." }));
        }
      });
      return;
    }
  }

  // ============================================================================
  // 2. STATIC FILE SERVING
  // ============================================================================

  // Clean URL resolution: /about -> /about.html, / -> /index.html
  if (pathname === "/") {
    pathname = "/index.html";
  } else if (!path.extname(pathname)) {
    if (fs.existsSync(path.join(ROOT_DIR, pathname + ".html"))) {
      pathname = pathname + ".html";
    }
  }

  const filePath = path.join(ROOT_DIR, pathname);

  // Security: Prevent directory traversal outside ROOT_DIR
  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Serve custom 404 page
      const notFoundPath = path.join(ROOT_DIR, "404.html");
      if (fs.existsSync(notFoundPath)) {
        res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
        return fs.createReadStream(notFoundPath).pipe(res);
      }
      res.writeHead(404, { "Content-Type": "text/plain" });
      return res.end("404 Not Found");
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    res.writeHead(200, { "Content-Type": contentType });
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer(handleRequest);

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`\n==================================================`);
    console.log(`🚀 LaunchFlow Starter Server Running!`);
    console.log(`🌐 Local URL:  http://localhost:${PORT}`);
    console.log(`🛠️  Health API: http://localhost:${PORT}/api/health`);
    console.log(`📦 Serving files from: ${ROOT_DIR}`);
    console.log(`==================================================\n`);
  });
}

module.exports = { server, handleRequest };
