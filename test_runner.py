#!/usr/bin/env python3
"""
==============================================================================
AUTOMATED INTEGRATION TEST SUITE (Python 3)
Verifies static files, HTML markup, configuration consistency, headers, and gitignore.
==============================================================================
"""

import os
import sys

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))

def run_tests():
    print("\n🧪 STARTING STATIC CODE & SECURITY AUDIT (Python)...\n")
    passed = 0
    failed = 0

    def check(condition, desc):
        nonlocal passed, failed
        if condition:
            print(f"  ✅ PASS: {desc}")
            passed += 1
        else:
            print(f"  ❌ FAIL: {desc}")
            failed += 1

    # 1. Verify Core HTML Files Exist and Contain Viewport Tags
    required_html = ["index.html", "about.html", "contact.html", "privacy.html", "terms.html", "404.html", "app.html"]
    for f in required_html:
        path = os.path.join(ROOT_DIR, f)
        check(os.path.isfile(path), f"File '{f}' exists")
        if os.path.isfile(path):
            with open(path, "r", encoding="utf-8") as handle:
                content = handle.read()
                check("<meta name=\"viewport\"" in content, f"File '{f}' has responsive viewport tag")
                check("site.config.js" in content or f == "404.html", f"File '{f}' references site.config.js")

    # 2. Verify Config & CSS
    config_path = os.path.join(ROOT_DIR, "site.config.js")
    check(os.path.isfile(config_path), "site.config.js exists")

    css_path = os.path.join(ROOT_DIR, "public", "css", "style.css")
    check(os.path.isfile(css_path), "style.css exists")
    if os.path.isfile(css_path):
        with open(css_path, "r", encoding="utf-8") as f:
            css_data = f.read()
            check("@media (max-width:" in css_data, "style.css contains responsive media queries")

    # 3. Verify Serverless Functions Exist
    functions = ["health.js", "contact.js", "auth.js", "data.js"]
    for fn in functions:
        fn_path = os.path.join(ROOT_DIR, "functions", "api", fn)
        check(os.path.isfile(fn_path), f"Edge function '{fn}' exists")

    # 4. Verify Security Configuration Files
    headers_path = os.path.join(ROOT_DIR, "_headers")
    check(os.path.isfile(headers_path), "Cloudflare _headers file exists")
    if os.path.isfile(headers_path):
        with open(headers_path, "r", encoding="utf-8") as f:
            headers_content = f.read()
            check("Strict-Transport-Security:" in headers_content, "_headers includes HSTS (Strict-Transport-Security)")
            check("X-Content-Type-Options: nosniff" in headers_content, "_headers includes X-Content-Type-Options")
            check("X-Frame-Options: DENY" in headers_content, "_headers includes X-Frame-Options: DENY")

    redirects_path = os.path.join(ROOT_DIR, "_redirects")
    check(os.path.isfile(redirects_path), "Cloudflare _redirects file exists")

    # 5. Verify .env.example and .gitignore Rules
    env_example_path = os.path.join(ROOT_DIR, ".env.example")
    check(os.path.isfile(env_example_path), ".env.example exists in project root")
    if os.path.isfile(env_example_path):
        with open(env_example_path, "r", encoding="utf-8") as f:
            env_content = f.read()
            check("DEMO_AUTH_TOKEN=" in env_content, ".env.example documents DEMO_AUTH_TOKEN")
            check("RESEND_API_KEY=" in env_content, ".env.example documents RESEND_API_KEY")

    gitignore_path = os.path.join(ROOT_DIR, ".gitignore")
    check(os.path.isfile(gitignore_path), ".gitignore exists in project root")
    if os.path.isfile(gitignore_path):
        with open(gitignore_path, "r", encoding="utf-8") as f:
            gi_content = f.read()
            check(".env" in gi_content, ".gitignore excludes .env files")
            check("node_modules/" in gi_content, ".gitignore excludes node_modules/")
            check("*.pem" in gi_content and "*.key" in gi_content, ".gitignore excludes cryptographic credentials (*.pem, *.key)")

    print("\n==================================================")
    print(f"🏁 PYTHON TEST SUMMARY: {passed} PASSED, {failed} FAILED")
    print("==================================================\n")

    if failed > 0:
        sys.exit(1)
    else:
        sys.exit(0)

if __name__ == "__main__":
    run_tests()
