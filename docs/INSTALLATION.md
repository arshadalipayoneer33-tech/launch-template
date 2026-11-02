# Installation & Local Setup Guide

This guide walks you through running the project locally on macOS, Linux, or Windows with zero paid tools or complex dependencies.

---

## Prerequisites (Choose Either Option A or B)

You do **not** need both. The project is designed with dual-runtime compatibility:

### Option A: Node.js (Recommended)
* **Version:** Node.js v18.0.0 or higher.
* Built-in standard library used (`node:http`, `node:fs`). Zero `npm install` packages required for basic execution.

### Option B: Python 3 (Fallback)
* **Version:** Python 3.8 or higher.
* Built-in standard library used (`http.server`, `urllib`). Zero `pip install` packages required.

---

## Step 1: Clone or Navigate to the Project

Open your terminal and navigate to the project directory:

```bash
cd /Users/mahin/.gemini/antigravity/scratch/launch-template
```

---

## Step 2: Configure Environment Variables

Create your local environment configuration file:

```bash
cp .env.example .env
```

*(For local testing, the default values in `.env.example` work out of the box with zero modifications).*

---

## Step 3: Start the Local Development Server

### If using Node.js:
Run the zero-dependency local Node server:

```bash
node server.js
```
*Or via npm:*
```bash
npm start
```

### If using Python 3:
Run the zero-dependency Python server:

```bash
python3 server.py
```

---

## Step 4: Open in Your Web Browser

Open your browser and navigate to:

* **Homepage:** [http://localhost:3000/](http://localhost:3000/)
* **Application Dashboard:** [http://localhost:3000/app.html](http://localhost:3000/app.html)
* **Contact Page:** [http://localhost:3000/contact.html](http://localhost:3000/contact.html)
* **API Health Check:** [http://localhost:3000/api/health](http://localhost:3000/api/health)

---

## Step 5: Run Automated Integration Tests

To verify that all pages, routing rules, edge API endpoints, form validation, and security headers are working properly:

### Node.js Test Suite:
```bash
node test_runner.js
```

### Python Static & Integrity Test Suite:
```bash
python3 test_runner.py
```
