# Free Deployment Guide

This guide details how to deploy your website and serverless application to **Cloudflare Pages** (primary recommendation), **Vercel**, or **GitHub Pages** for **\$0/month** without purchasing a domain or credit card.

---

## 1. Cloudflare Pages Deployment (Recommended)

Cloudflare Pages provides global edge distribution, automated SSL, and native support for serverless edge functions (`/functions`).

### Verified Free Tier Limits (Cloudflare Pages)
* **Static Asset Bandwidth:** Included under Cloudflare's standard Free Plan Fair Use Policy.
* **Monthly Builds:** Up to 500 builds per month (1 concurrent build).
* **Edge Functions (Workers):** Up to 100,000 requests per day across your account on the free tier.
* **Custom Domains:** Supports free custom domain mapping with automated SSL renewals.
* **Free Subdomain:** Provided automatically (`*.pages.dev`).

> [!NOTE]
> Functions run on ephemeral edge isolates. In-memory rate limiting and in-memory variables do not persist across separate edge isolates or function recycles. For persistent production state, connect an external database.

### Step-by-Step Instructions

#### Step 1: Push Code to a GitHub Repository
1. Log into your free [GitHub](https://github.com/) account.
2. Create a new repository (e.g., `my-online-business`).
3. In your terminal, initialize and push your project:
   ```bash
   cd /Users/mahin/.gemini/antigravity/scratch/launch-template
   git init
   git add .
   git commit -m "Initial commit of LaunchFlow starter"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/my-online-business.git
   git push -u origin main
   ```

#### Step 2: Connect to Cloudflare Pages
1. Go to the [Cloudflare Dashboard](https://dash.cloudflare.com/) and create a free account.
2. In the left navigation, click **Compute (Workers & Pages)** $\rightarrow$ **Create Application** $\rightarrow$ **Pages** $\rightarrow$ **Connect to Git**.
3. Select your GitHub repository (`my-online-business`).
4. Configure Build Settings:
   * **Project Name:** `my-online-business` (This determines your free subdomain: `my-online-business.pages.dev`).
   * **Production Branch:** `main`.
   * **Framework Preset:** `None` (Static HTML/JS).
   * **Build Command:** *(Leave blank)*.
   * **Build Output Directory:** `/` *(Root directory)*.
5. Click **Save and Deploy**.

Cloudflare will automatically build and deploy your site in under 60 seconds. Your live production URL will be:
`https://my-online-business.pages.dev`

---

## 2. Vercel Deployment (Alternative)

Vercel provides instant previews, global edge routing, and a free `*.vercel.app` subdomain.

### Verified Free Plan Limits (Vercel Hobby Tier)
* **Bandwidth:** 100 GB / month on Hobby tier.
* **Serverless Execution:** Standard Hobby tier limits (100 GB-hours / month).
* **Edge Requests:** 500,000 / month.

### Step-by-Step Instructions
1. Log into [Vercel](https://vercel.com/) with your GitHub account.
2. Click **Add New...** $\rightarrow$ **Project**.
3. Import your GitHub repository (`my-online-business`).
4. Keep the default settings and click **Deploy**.
5. Your project will be live at `https://my-online-business.vercel.app`.

---

## 3. GitHub Pages Deployment (Static Mode Only)

If you only require the static marketing site and client-side demo without serverless edge functions:
1. In your GitHub repository, click **Settings** $\rightarrow$ **Pages**.
2. Under **Build and deployment**, select **Deploy from a branch**.
3. Choose branch `main` and folder `/ (root)`.
4. Click **Save**.
5. Your site will be live at `https://YOUR_USERNAME.github.io/my-online-business/`.

---

## 4. Connecting a Custom Domain (Optional & Free)

When you are ready to use a custom domain (e.g., `yourbrand.com`):
1. In the Cloudflare Pages dashboard, go to your project $\rightarrow$ **Custom Domains**.
2. Click **Set up a custom domain** and enter your registered domain name.
3. Cloudflare will automatically provision a free universal SSL/TLS certificate with automated renewals.
