# Reusability & Multi-Project Guide

This guide explains how to quickly clone and rebrand this starter template for multiple independent online businesses without code conflicts or repetitive refactoring.

---

## 1. The Central Configuration Pattern

The entire template is driven by a single file: `site.config.js`.

```
site.config.js (Single Source of Truth)
   ├── Brand Identity (name, tagline, description, logo)
   ├── Color Palette (primary, accent, background)
   ├── Contact Information (email, address, response hours)
   ├── Social Media Links
   ├── Navigation Hierarchy
   ├── Feature Cards
   ├── Pricing Plans
   └── SEO Metadata
```

When you update `site.config.js`, the browser automatically propagates changes to:
1. All DOM elements containing `data-config="brand.name"`, `data-config="contact.supportEmail"`, etc.
2. Root CSS variables (`--color-primary`, `--color-accent`) for dynamic color schemes.
3. Footer copyright dates and business metadata.

---

## 2. Step-by-Step: Launching a Brand New Project

Follow these steps whenever you want to create a new online venture from this template:

### Step 1: Copy the Template Folder
Duplicate the template into a clean project directory:

```bash
cp -r /Users/mahin/.gemini/antigravity/scratch/launch-template /Users/mahin/.gemini/antigravity/scratch/my-new-saas
cd /Users/mahin/.gemini/antigravity/scratch/my-new-saas
```

### Step 2: Edit `site.config.js`
Open `site.config.js` and update your business details:

```javascript
brand: {
  name: "RankPulse AI",
  tagline: "Automated SEO Keyword Monitoring for Solopreneurs",
  description: "Track your competitor keyword movements on Google search without enterprise software costs.",
  logoText: "RankPulse",
  logoIcon: "📈",
  accentWord: "Intelligently.",
},
colors: {
  primary: "#7c3aed",      // Switch to Violet/Purple theme
  primaryHover: "#6d28d9",
  accent: "#f59e0b",       // Amber accent
}
```

### Step 3: Test Locally
```bash
node server.js
```
Open [http://localhost:3000](http://localhost:3000) to see your new brand name, colors, and copy immediately reflected across the entire website and application demo!

### Step 4: Initialize a Clean Git Repository
```bash
rm -rf .git
git init
git add .
git commit -m "Initial commit for RankPulse AI"
```

### Step 5: Deploy to Cloudflare Pages
Follow the instructions in `docs/DEPLOYMENT.md` to link your new GitHub repository to Cloudflare Pages. Within 60 seconds, your new business is live on its own free subdomain (e.g., `rankpulse.pages.dev`).
