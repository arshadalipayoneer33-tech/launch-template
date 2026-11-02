# ⚡ LaunchFlow — Complete Website & Web App Starter

A production-grade, zero-cost, reusable website and web application foundation engineered for solopreneurs, digital agencies, and micro-SaaS builders.

---

## 🌟 Highlights

* **100% Free Hosting & Deployment:** Deploys natively to **Cloudflare Pages**, **Vercel**, or **GitHub Pages** with automated SSL and a free subdomain (`*.pages.dev`).
* **Zero Platform Lock-in:** Completely independent of Showit, WordPress, Webflow, or proprietary site builders. Built on open web standards.
* **Dual-Runtime Zero-Dependency Development:** Runs locally with **Node.js** (`node server.js`) or **Python 3** (`python3 server.py`) with zero initial package installations.
* **Production-Grade Security:** Pre-configured Content Security Policy (CSP), anti-clickjacking headers (`X-Frame-Options: DENY`), edge IP rate limiting, input sanitization, and invisible honeypot spam protection.
* **Single Source of Truth Configuration:** Rebrand and customize the entire site (brand name, colors, copy, contact info, pricing plans) from a single file: `site.config.js`.
* **Micro-SaaS Application Foundation:** Includes an interactive client dashboard with CRUD data persistence, real-time API health monitoring, mock authentication, and architecture hooks for Supabase or Cloudflare D1.

---

## 📁 Project Architecture

```
launch-template/
├── site.config.js            # Single source of truth for branding, colors, links & SEO
├── index.html                # Modern, responsive homepage (Hero, Features, Pricing, FAQ)
├── about.html                # About Us, Mission, Tech Stack & Security Overview
├── contact.html              # Validated contact form with anti-bot honeypot protection
├── privacy.html              # GDPR/CCPA-aligned Privacy Policy
├── terms.html                # Commercial Terms of Service & MIT Open-Source License
├── 404.html                  # Branded 404 Error page with navigation recovery
├── app.html                  # Interactive Application Foundation / Founder Control Center
│
├── functions/api/            # Cloudflare Pages Serverless Edge Functions
│   ├── health.js             # Live API health check endpoint (/api/health)
│   ├── contact.js            # Secure contact form handler with rate limiting & sanitization
│   ├── auth.js               # Server-side Bearer token auth verification endpoint
│   └── data.js               # CRUD persistence endpoint
│
├── public/                   # Static assets
│   ├── css/
│   │   ├── style.css         # Modern CSS system, custom properties, responsive breakpoints
│   │   └── components.css    # Primitives: Nav, Cards, Buttons, Forms, Toasts, Modals
│   ├── js/
│   │   ├── config-loader.js  # Dynamically synchronizes site.config.js into DOM elements
│   │   ├── main.js           # Theme toggle (Dark/Light), mobile drawer, toast manager
│   │   ├── contact.js        # Contact form validation & edge API integration
│   │   └── app-demo.js       # Dashboard CRUD manager, auth state, and live API status
│   └── favicon.svg           # High-resolution vector icon
│
├── _headers                  # Cloudflare Pages production security headers (CSP, HSTS)
├── _redirects                # Edge routing rules & clean 404 handling
├── .env.example              # Environment variables template with explanations
├── .gitignore                # Standard repository exclusion rules
├── package.json              # Project scripts and metadata
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
# Option A: Node.js
node server.js

# Option B: Python 3
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
5. Click **Save and Deploy**. Your site and edge functions are live on your free `*.pages.dev` subdomain!

Detailed deployment instructions are available in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

---

## 📄 License
This project is licensed under the permissive **MIT License** — free for personal and commercial use.
