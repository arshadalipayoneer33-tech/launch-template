# Security Architecture & Production Audit Checklist

This document details the security practices implemented in LaunchFlow, how threats are mitigated, and what requires configuration before handling live payments or confidential user data.

---

## 1. Implemented Protections (Built-In)

| Security Domain | Mechanism Implemented | File Location | Purpose |
| :--- | :--- | :--- | :--- |
| **Secrets Management** | Zero hardcoded keys; `.env.example` template | `.gitignore`, `.env.example` | Prevents credential leaks in Git history |
| **Clickjacking** | `X-Frame-Options: DENY` | `_headers`, `server.js` | Stops malicious framing & UI redressing |
| **MIME Sniffing** | `X-Content-Type-Options: nosniff` | `_headers`, `server.js` | Prevents browsers from executing non-script assets |
| **Content Security** | Strict Content Security Policy (CSP) | `_headers` | Restricts script sources and blocks unauthorized external iframes |
| **Honeypot Bot Trap** | Invisible form trap (`#website_hp`) | `contact.html`, `functions/api/contact.js` | Silently catches automated form spam without annoying human CAPTCHAs |
| **Input Sanitization** | HTML tag stripping (`replace(/[<>]/g, "")`) | `functions/api/contact.js`, `functions/api/data.js` | Neutralizes stored and reflected Cross-Site Scripting (XSS) |
| **Edge Rate Limiting** | In-memory IP request tracker | `functions/api/contact.js`, `server.js` | Blocks brute-force spam floods (limits to 5 submissions / 10 min) |
| **Hardware Privacy** | `Permissions-Policy: camera=(), mic=()` | `_headers` | Disables browser hardware access for privacy compliance |

---

## 2. Production Security Audit Checklist

Before scaling this starter to production for commercial billing or sensitive user accounts, verify the following checklist:

### Pre-Launch Checks
- [ ] **Rotate Secret Keys:** Ensure no test tokens (e.g., `demo-token`) are enabled on production endpoints.
- [ ] **Cloudflare Environment Variables:** Add live production secrets (e.g., `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`) directly in the Cloudflare Pages Dashboard under **Settings $\rightarrow$ Environment Variables**.
- [ ] **Strict CORS Origins:** If separating your frontend and backend domains, replace `"Access-Control-Allow-Origin": "*"` with your explicit production domain (e.g., `"https://yourdomain.com"`).
- [ ] **Distributed Rate Limiting:** For high-volume production deployments (>100k visitors/day), transition the in-memory rate limiter in `functions/api/contact.js` to **Cloudflare KV** or **Upstash Redis** to synchronize IP limits across global edge nodes.
- [ ] **Database Row Level Security (RLS):** If connecting Supabase or PostgreSQL, ensure Row Level Security is enabled on every table so users can only read/write their own records.
- [ ] **Payment Compliance (PCI-DSS):** Never collect credit card numbers directly through your server. Always use hosted checkout redirects or embedded elements from **Stripe**, **Lemon Squeezy**, or **Paddle**.

---

## 3. Vulnerability Disclosure & Maintenance

To report potential security vulnerabilities or review dependency security:
1. Run static integrity scans: `python3 test_runner.py`
2. Run automated integration assertions: `node test_runner.js`
3. Audit dependencies: `npm audit`
