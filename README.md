# ⚡ LaunchFlow — Reusable Website & Web App Starter

A clean, modular, zero-cost website and web application starter template engineered for solopreneurs, digital agencies, and micro-SaaS builders to validate ideas quickly without recurring platform fees.

---

## 🌟 Highlights

* **Free Hosting & Deployment:** Deploys natively to **Cloudflare Pages**, **Vercel**, or **GitHub Pages** with automated SSL and a free provider subdomain (`*.pages.dev` or `*.vercel.app`).
* **Zero Platform Lock-in:** Completely independent of Showit, WordPress, Webflow, or proprietary site builders. Built on open web standards (HTML5, CSS3, ES6+ JS).
* **Dual-Runtime Zero-Dependency Development:** Runs locally with **Node.js** (`node server.js`) or **Python 3** (`python3 server.py`) with zero initial package installations.
* **Baseline Security Configuration:** Pre-configured Content Security Policy (CSP), HTTP Strict Transport Security (HSTS), anti-clickjacking headers (`X-Frame-Options: DENY`), edge IP rate limiting, input sanitization, and invisible honeypot spam protection.
* **Single Source of Truth Configuration:** Rebrand and customize the entire site (brand name, colors, copy, contact info, pricing plans) from a single file: `site.config.js`.
* **Application Foundation (Demo Mode):** Includes an interactive client dashboard with CRUD data manager, real-time API health monitoring, mock authentication verification, and architecture hooks for Supabase or Cloudflare D1.

---

## ⚠️ Important Demo Limitations (Read Before Production Use)

This starter project is pre-configured for a **safe public demonstration and rapid business validation**. Before handling real customer payments or confidential user data, complete the following:

1. **Authentication:** The `/api/auth` endpoint is a **demonstration check** that verifies a static demo session token (`launchflow-demo-session-token-v1`). It does not provide cryptographic user session management. Replace it with an identity provider (such as Supabase Auth, Clerk, or Auth0) before production.
2. **Data Persistence:** The `/api/data` endpoint stores records in **ephemeral in-memory storage** and browser `localStorage`. Records do not persist across serverless restarts and provide no private multi-tenant isolation. Connect an external database (e.g. Supabase PostgreSQL or Cloudflare D1) for production storage.
3. **Contact Form Delivery:** Out-of-the-box, form submissions are validated and logged to the server console. They are **not delivered to an email inbox** until you add a mail delivery provider (such as Resend or a webhook) to your `.env` file or Cloudflare Pages environment variables.
4. **Security Review:** While baseline headers (HSTS, CSP, X-Frame-Options) and rate-limiting are included, this project must undergo an appropriate security review before describing any commercial deployment as production-ready.

---

## 📁 Project Architecture

```
launch-template/
├── site.config.js            # Single source of truth for branding, colors, links & SEO
├── index.html                # Modern, responsive homepage (Hero, Features, Pricing, FAQ)
├── about.html                # About Us, Mission, Tech Stack & Security Baseline
├── contact.html              # Validated contact form with anti-bot honeypot protection
├── privacy.html              # GDPR/CCPA-aligned Privacy Policy
├── terms.html                # Commercial Terms of Service & MIT Open-Source License
├── 404.html                  # Branded 404 Error page with navigation recovery
├── app.html                  # Interactive Application Foundation / Demo Control Center
│
├── functions/api/            # Cloudflare Pages Serverless Edge Functions
│   ├── health.js             # Live API health check endpoint (/api/health)
│   ├── contact.js            # Contact form handler with rate limiting & sanitization
│   ├── auth.js               # Demo token verification endpoint (Simulation)
│   └── data.js               # Ephemeral demo CRUD endpoint
│
├── public/                   # Static assets
│   ├── css/
│   │   ├── style.css         # Modern CSS system, custom properties, responsive breakpoints
│   │   └── components.css    # Primitives: Nav, Cards, Buttons, Forms, Toasts, Modals
│   ├── js/
│   │   ├── config-loader.js  # Dynamically synchronizes site.config.js into DOM elements
│   │   ├── main.js           # Theme toggle (Dark/Light), mobile drawer, toast manager
│   │   ├── contact.js        # Contact form validation & edge API integration
│   │   └── app-demo.js       # Dashboard CRUD manager, demo auth, and live API status
│   └── favicon.svg           # High-resolution vector icon
│
├── _headers                  # Cloudflare Pages security headers (CSP, HSTS, X-Frame-Options)
├── _redirects                # Edge routing rules & clean 404 handling
├── .env.example              # Environment variables template with explanations
├── .gitignore                # Comprehensive Git exclusion rules (secrets, credentials, node_modules)
├── package.json              # Project scripts, metadata, and packaging command
├── server.js                 # Zero-dependency Node.js development server
├── server.py                 # Zero-dependency Python 3 development server
├── test_runner.js            # Node in-memory automated integration test suite
├── test_runner.py            # Python static analysis and integrity test suite
│
└── docs/                     # Comprehensive documentation
    ├── INSTALLATION.md       # Step-by-step local setup instructions
    ├── DEPLOYMENT.md         # Free Cloudflare Pages & Vercel deployment guide
    ├── SECURITY.md           # Security practices and production audit checklist
    ├── REUSABILITY.md        # How to clone and brand this template for a new business
    └── TROUBLESHOOTING.md    # Common development issues and solutions
```

---

## 🚀 Quick Start (Under 60 Seconds)

### 1. Start the Local Server
Choose either Node or Python:

```bash
# Option A: Node.js (v18+)
node server.js

# Option B: Python 3 (3.8+)
python3 server.py
```

### 2. View in Browser
* **Website:** [http://localhost:3000](http://localhost:3000)
* **Application Dashboard:** [http://localhost:3000/app.html](http://localhost:3000/app.html)

### 3. Run Automated Integration Tests
```bash
node test_runner.js
python3 test_runner.py
```

---

## 📦 Packaging Without Missing Hidden Files (`.env.example`, `.gitignore`)

Standard shell wildcards (`*`) omit hidden dotfiles by default. To package the project properly:

```bash
# Using npm script:
npm run package:zip

# Or manually via zip:
zip -r launchflow-starter.zip . -x "*.git*" -x "*node_modules*" -x "*.DS_Store*"
```
This guarantees `.env.example`, `.gitignore`, `_headers`, and `_redirects` are included in the archive.

---

## 🎨 How to Rebrand for a New Business in 3 Minutes

1. Open `site.config.js`.
2. Update the brand name, tagline, description, and primary colors:
   ```javascript
   brand: {
     name: "MyNewBusiness",
     tagline: "High-Value B2B Services",
     accentWord: "Effortlessly.",
   },
   colors: {
     primary: "#10b981", // Switch to Emerald Green
   }
   ```
3. Refresh the browser. All pages, typography, buttons, and navigation links update dynamically.

---

## 🌐 Deploy Free to Cloudflare Pages

1. Push your project to a free GitHub repository.
2. In Cloudflare Dashboard, go to **Compute (Workers & Pages)** $\rightarrow$ **Pages** $\rightarrow$ **Connect to Git**.
3. Select your repository.
4. Set **Build Output Directory** to `/` (Root directory).
5. Click **Save and Deploy**. Your site and edge functions will be live on your free `*.pages.dev` subdomain.

Detailed deployment instructions and verified provider limits are in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

---

## 📄 License
This project is licensed under the permissive **MIT License** — free for personal and commercial use.
