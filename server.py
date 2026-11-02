#!/usr/bin/env python3
"""
==============================================================================
ZERO-DEPENDENCY PYTHON 3 LOCAL DEVELOPMENT SERVER (server.py)
Uses standard Python library (http.server, urllib, json).
Runs on any machine with Python 3 installed.
==============================================================================
"""

import http.server
import socketserver
import os
import json
from urllib.parse import urlparse
from datetime import datetime

PORT = int(os.environ.get("PORT", 3000))
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))

class LaunchFlowHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT_DIR, **kwargs)

    def end_headers(self):
        # Inject standard security headers (matching Cloudflare Pages _headers)
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        self.send_header("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")
        super().end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        # 1. API: /api/health
        if path == "/api/health":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            payload = {
                "status": "healthy",
                "version": "1.0.1",
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "environment": "local-python-dev"
            }
            self.wfile.write(json.dumps(payload, indent=2).encode("utf-8"))
            return

        # 2. Clean URL resolution: /about -> /about.html
        if path != "/" and not os.path.splitext(path)[1]:
            candidate = os.path.join(ROOT_DIR, path.lstrip("/") + ".html")
            if os.path.isfile(candidate):
                self.path = path + ".html"

        # Check if file exists; if not, serve 404.html
        full_path = self.translate_path(self.path)
        if not os.path.exists(full_path):
            self.send_response(404)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            custom_404 = os.path.join(ROOT_DIR, "404.html")
            if os.path.exists(custom_404):
                with open(custom_404, "rb") as f:
                    self.wfile.write(f.read())
            else:
                self.wfile.write(b"<h1>404 Not Found</h1>")
            return

        super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        # API: /api/contact
        if path == "/api/contact":
            content_length = int(self.headers.get("Content-Length", 0))
            body_bytes = self.rfile.read(content_length)

            try:
                data = json.loads(body_bytes.decode("utf-8"))
            except Exception:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": "Invalid JSON"}).encode("utf-8"))
                return

            name = str(data.get("name", "")).strip()
            email = str(data.get("email", "")).strip()
            message = str(data.get("message", "")).strip()
            honeypot = str(data.get("honeypot", "")).strip()

            if honeypot:
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({
                    "success": True,
                    "deliveredToEmail": False,
                    "message": "Submission accepted."
                }).encode("utf-8"))
                return

            if len(name) < 2 or "@" not in email or len(message) < 10:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": "Validation failed."}).encode("utf-8"))
                return

            print(f"[Python Server Contact] From: {name} <{email}>")

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({
                "success": True,
                "deliveredToEmail": False,
                "demoMode": True,
                "message": "Demo submission validated and logged on server. (Note: Email delivery requires configuring RESEND_API_KEY in .env)."
            }).encode("utf-8"))
            return

        self.send_response(404)
        self.end_headers()

if __name__ == "__main__":
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), LaunchFlowHandler) as httpd:
        print(f"\n==================================================")
        print(f"🚀 Python Local Dev Server Running!")
        print(f"🌐 Local URL:  http://localhost:{PORT}")
        print(f"🛠️  Health API: http://localhost:{PORT}/api/health")
        print(f"==================================================\n")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")
