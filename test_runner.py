#!/usr/bin/env python3
"""
==============================================================================
AUTOMATED INTEGRATION TEST SUITE (Python 3)
Verifies static files, HTML markup, configuration consistency, and routing.
==============================================================================
"""

import os
import re
import sys
import json

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))

def run_tests():
    print("\n🧪 STARTING STATIC CODE & ASSET VERIFICATION (Python)...\n")
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

    # 1. Verify Core HTML Files Exist
    required_html = ["index.html", "about.html", "contact.html", "privacy.html", "terms.html", "404.html", "app.html"]
    for f in required_html:
        path = os.path.join(ROOT_DIR, f)
        check(os.path.isfile(path), f"File '{f}' exists")
        if os.path.isfile(path):
            with open(path, "r", encoding="utf-8") as handle:
                content = handle.read()
                check("<meta name=\"viewport\"" in content, f"File '{f}' has responsive viewport tag")
                check("site.config.js" in content or f == "404.html", f"File '{f}' loads site.config.js")

    # 2. Verify Config & CSS
    config_path = os.path.join(ROOT_DIR, "site.config.js")
    check(os.path.isfile(config_path), "site.config.js exists")

    css_path = os.path.join(ROOT_DIR, "public", "css", "style.css")
    check(os.path.isfile(css_path), "style.css exists")
    if os.path.isfile(css_path):
        with open(css_path, "r", encoding="utf-8") as f:
            css_data = f.read()
            check("@media (max-width:" in css_data, "style.css contains responsive media queries")

    # 3. Verify Serverless Functions
    functions = ["health.js", "contact.js", "auth.js", "data.js"]
    for fn in functions:
        fn_path = os.path.join(ROOT_DIR, "functions", "api", fn)
        check(os.path.isfile(fn_path), f"Edge function '{fn}' exists")

    # 4. Verify Security Config
    check(os.path.isfile(os.path.join(ROOT_DIR, "_headers")), "Cloudflare _headers file exists")
    check(os.path.isfile(os.path.join(ROOT_DIR, "_redirects")), "Cloudflare _redirects file exists")
    check(os.path.isfile(os.path.join(ROOT_DIR, ".env.example")), ".env.example exists")
    check(os.path.isfile(os.path.join(ROOT_DIR, ".gitignore")), ".gitignore exists")

    print("\n==================================================")
    print(f"🏁 PYTHON TEST SUMMARY: {passed} PASSED, {failed} FAILED")
    print("==================================================\n")

    if failed > 0:
        sys.exit(1)
    else:
        sys.exit(0)

if __name__ == "__main__":
    run_tests()
