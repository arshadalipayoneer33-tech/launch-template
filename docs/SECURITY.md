# Security Architecture & Production Audit Checklist

This document details the baseline security practices implemented in LaunchFlow, how threats are mitigated in the demo starter, and what requires configuration before handling live payments or confidential user data.

---

## 1. Implemented Protections (Demo Baseline)

| Security Domain | Mechanism Implemented | File Location | Purpose & Limitations |
| :--- | :--- | :--- | :--- |
| **Secrets Management** | Zero hardcoded keys; `.env.example` template | `.gitignore`, `.env.example` | Prevents credential leaks in Git history. `.env` is strictly ignored. |
| **HSTS (Strict-Transport-Security)** | `max-age=31536000; includeSubDomains; preload` | `_headers`, `server.js` | Enforces HTTPS connections and prevents SSL-stripping man-in-the-middle attacks. |
| **Clickjacking** | `X-Frame-Options: DENY` | `_headers`, `server.js` | Stops malicious framing and UI redressing attacks. |
| **MIME Sniffing** | `X-Content-Type-Options: nosniff` | `_headers`, `server.js` | Prevents browsers from executing non-script assets. |
| **Content Security** | Content Security Policy (CSP) | `_headers` | Restricts script sources and blocks unauthorized external iframes. |
| **Honeypot Bot Trap** | Invisible form trap (`#website_hp`) | `contact.html`, `functions/api/contact.js` | Catches basic automated spammers without frustrating human users with CAPTCHAs. |
| **Input Sanitization** | HTML tag stripping (`replace(/[<>]/g, "")`) | `functions/api/contact.js`, `functions/api/data.js` | Neutralizes basic HTML injection and Cross-Site Scripting (XSS). |
| **Edge Rate Limiting** | In-memory IP request tracker | `functions/api/contact.js`, `server.js` | Limits to 5 submissions per 10 minutes per IP. *(Note: in-memory state is isolated per serverless edge instance).* |
| **Hardware Privacy** | `Permissions-Policy: camera=(), mic=()` | `_headers` | Disables browser hardware access for privacy compliance. |
| **CORS Restriction** | Same-origin by default; no wildcard `*` on sensitive routes | `functions/api/*`, `server.js` | Prevents unauthorized third-party origins from reading API responses. |

---

## 2. Explicit Demo Limitations (Not Production-Ready Without Setup)

The following components are designed as **interactive demonstrations** and MUST be upgraded before production deployment:

1. **Authentication (`/api/auth`):**
   * *Current State:* Simulates token verification using a static demo token (`launchflow-demo-session-token-v1`).
   * *Production Requirement:* Replace with a cryptographic JWT verifier (e.g., Supabase Auth SDK, Clerk, or Jose JWT verification) that validates signatures using asymmetric keys and checks token expiration.
2. **Data Store (`/api/data`):**
   * *Current State:* Uses an ephemeral in-memory JavaScript array and browser `localStorage`.
   * *Production Requirement:* Connect this endpoint to a managed SQL database (such as Supabase PostgreSQL or Cloudflare D1) and enforce Row Level Security (RLS) policies.
3. **Contact Delivery (`/api/contact`):**
   * *Current State:* Validates and logs submissions to the server console. Does NOT send emails.
   * *Production Requirement:* Configure `RESEND_API_KEY` and `CONTACT_RECIPIENT_EMAIL` in `.env` to enable live inbox delivery.
4. **Distributed Rate Limiting:**
   * *Current State:* Rate limiting relies on in-memory Maps, which do not synchronize across globally distributed Cloudflare edge locations.
   * *Production Requirement:* Use Cloudflare KV or Upstash Redis for multi-region synchronized IP rate-limiting.

---

## 3. Production Security Audit Checklist

Before scaling this starter to production for commercial billing or sensitive user accounts, verify the following checklist:

- [ ] **Verify .env is Not Committed:** Run `git status` to ensure `.env` is ignored by Git.
- [ ] **Configure Real Identity Provider:** Implement cryptographic JWT verification in `/functions/api/auth.js`.
- [ ] **Connect Production Database:** Replace in-memory arrays in `/functions/api/data.js` with PostgreSQL/D1 queries.
- [ ] **Enable Row Level Security (RLS):** If using Supabase, ensure RLS policies are enabled on all user-facing tables.
- [ ] **Set Live Environment Variables:** Add live keys in Cloudflare Pages Dashboard under **Settings $\rightarrow$ Environment Variables**.
- [ ] **Payment Compliance (PCI-DSS):** Never collect raw credit card details on your server. Always use hosted checkout redirects or embedded payment elements from Stripe, Lemon Squeezy, or Paddle.
- [ ] **Perform Security Review:** Conduct a security review and dependency audit before marketing the project as production-ready.
