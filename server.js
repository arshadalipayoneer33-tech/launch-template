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
const DEMO_AUTH_TOKEN = process.env.DEMO_AUTH_TOKEN || "launchflow-demo-session-token-v1";

// In-memory rate limiting map for local testing
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;

// In-memory items store for local CRUD demonstration
const demoInMemoryItems = [
  { id: "demo_1", title: "Launch MVP on Cloudflare Pages", status: "Completed", date: "Today" },
  { id: "demo_2", title: "Validate first $100 service offer", status: "In Progress", date: "Tomorrow" },
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

function handleRequest(req, res) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  let pathname = parsedUrl.pathname;

  // Standard security headers (matching Cloudflare Pages _headers)
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");

  // ============================================================================
  // 1. API ROUTES (Emulates Cloudflare Pages Functions)
  // ============================================================================

  // Route: /api/health
  if (pathname === "/api/health" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(
      JSON.stringify({
        status: "healthy",
        version: "1.0.1",
        timestamp: new Date().toISOString(),
        environment: "local-node-dev",
      })
    );
  }

  // Route: /api/auth (Demonstration Only)
  if (pathname === "/api/auth" && req.method === "GET") {
    const authHeader = req.headers["authorization"];
    res.setHeader("Content-Type", "application/json");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.writeHead(401);
      return res.end(
        JSON.stringify({
          authenticated: false,
          isDemo: true,
          error: "Missing or malformed Authorization header. Expected 'Bearer <token>'.",
        })
      );
    }

    const token = authHeader.split(" ")[1]?.trim();

    // Strict check: only accept the configured demo token (No insecure arbitrary string fallback)
    if (token === DEMO_AUTH_TOKEN) {
      res.writeHead(200);
      return res.end(
        JSON.stringify({
          authenticated: true,
          isDemo: true,
          warning: "DEMO MODE ONLY: Authenticated via static demo session token. Connect a real identity provider before production use.",
          user: {
            id: "demo_usr_founder",
            email: "demo@example.com",
            role: "demo_admin",
          },
        })
      );
    }

    res.writeHead(401);
    return res.end(
      JSON.stringify({
        authenticated: false,
        isDemo: true,
        error: "Invalid token. For demo testing, provide the configured demo token.",
      })
    );
  }

  // Route: /api/contact
  if (pathname === "/api/contact") {
    if (req.method === "OPTIONS") {
      res.writeHead(204);
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
        if (rawBody.length > 1e6) req.destroy();
      });

      req.on("end", () => {
        try {
          const body = JSON.parse(rawBody || "{}");
          const { name, email, subject, message, honeypot } = body;

          // Honeypot bot trap
          if (honeypot && honeypot.trim().length > 0) {
            res.writeHead(200);
            return res.end(
              JSON.stringify({
                success: true,
                deliveredToEmail: false,
                message: "Submission accepted.",
              })
            );
          }

          // Validation
          if (!name || typeof name !== "string" || name.trim().length < 2) {
            res.writeHead(400);
            return res.end(JSON.stringify({ success: false, error: "Name must be at least 2 characters." }));
          }

          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!email || typeof email !== "string" || !emailRegex.test(email)) {
            res.writeHead(400);
            return res.end(JSON.stringify({ success: false, error: "A valid email address is required." }));
          }

          if (!message || typeof message !== "string" || message.trim().length < 10) {
            res.writeHead(400);
            return res.end(JSON.stringify({ success: false, error: "Message must be at least 10 characters." }));
          }

          userRequests.push(now);
          rateLimitMap.set(clientIp, userRequests);

          console.log(`[Contact Submission] From: ${name} <${email}>`);

          // Transparent response: acknowledge logging, but do not claim email dispatch
          res.writeHead(200);
          return res.end(
            JSON.stringify({
              success: true,
              deliveredToEmail: false,
              demoMode: true,
              message: "Demo submission validated and logged on server. (Note: Email delivery requires configuring RESEND_API_KEY in .env).",
              data: {
                receivedAt: new Date().toISOString(),
                sender: name.trim().replace(/[<>]/g, ""),
              },
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

  // Route: /api/data (Ephemeral Demo CRUD)
  if (pathname === "/api/data") {
    res.setHeader("Content-Type", "application/json");

    if (req.method === "GET") {
      res.writeHead(200);
      return res.end(
        JSON.stringify({
          success: true,
          isDemoStore: true,
          storageType: "ephemeral-in-memory",
          warning: "DEMO DATA STORE: Data is held in volatile memory and is neither persistent nor private. Connect a database (e.g. Supabase, Cloudflare D1) for production storage.",
          count: demoInMemoryItems.length,
          items: demoInMemoryItems,
        })
      );
    }

    if (req.method === "POST") {
      let raw = "";
      req.on("data", (c) => (raw += c));
      req.on("end", () => {
        try {
          const b = JSON.parse(raw || "{}");
          if (!b.title || typeof b.title !== "string" || b.title.trim().length < 3) {
            res.writeHead(400);
            return res.end(JSON.stringify({ success: false, error: "Title must be at least 3 characters." }));
          }

          const item = {
            id: "demo_" + Date.now(),
            title: String(b.title).replace(/[<>]/g, "").trim(),
            status: b.status || "Active",
            date: new Date().toLocaleDateString(),
          };
          demoInMemoryItems.unshift(item);
          res.writeHead(201);
          return res.end(
            JSON.stringify({
              success: true,
              isDemoStore: true,
              storageType: "ephemeral-in-memory",
              message: "Item saved to ephemeral demo memory. (Will reset on server restart).",
              item,
            })
          );
        } catch (e) {
          res.writeHead(400);
          return res.end(JSON.stringify({ success: false, error: "Invalid JSON format." }));
        }
      });
      return;
    }
  }

  // ============================================================================
  // 2. STATIC FILE SERVING
  // ============================================================================

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
