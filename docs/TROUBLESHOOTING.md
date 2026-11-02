# Troubleshooting & Diagnostics Guide

Common development and deployment questions, diagnostic checks, and fixes.

---

## 1. Port 3000 Already in Use (`EADDRINUSE`)

### Symptom:
When running `node server.js` or `python3 server.py`, you receive:
`Error: listen EADDRINUSE: address already in use :::3000`

### Solution:
Specify an alternate port via environment variables:

#### On macOS / Linux:
```bash
PORT=3001 node server.js
```
*Or for Python:*
```bash
PORT=3001 python3 server.py
```

---

## 2. Contact Form Submissions Fail Locally

### Symptom:
Submitting the form on `contact.html` displays:
*"Network connection error. If you are running locally without the backend API, submissions are simulated."*

### Cause:
You opened the file directly in your browser using the `file://` protocol (e.g., `file:///path/to/contact.html`) instead of running the development server.

### Solution:
Always run the local server (`node server.js` or `python3 server.py`) and navigate to:
`http://localhost:3000/contact.html`

---

## 3. Dark Theme Not Persisting

### Symptom:
The theme resets back to light mode when refreshing the page.

### Solution:
Check if your browser has disabled `localStorage` or is running in a strict private browsing mode that blocks client-side storage. Clear site cookies and verify storage access in DevTools $\rightarrow$ **Application** $\rightarrow$ **Local Storage**.

---

## 4. Cloudflare Pages Function Returns 404

### Symptom:
After deploying to Cloudflare Pages, calling `/api/health` or `/api/contact` returns `404 Not Found`.

### Solution:
Ensure your functions folder is located at the **root of your repository**:
```
/functions/api/health.js
/functions/api/contact.js
```
Do **not** place the `functions/` directory inside `public/`. Cloudflare Pages only detects edge serverless functions when located in the top-level `/functions/` folder.

---

## 5. Automated Tests Failing

### Symptom:
Running `node test_runner.js` fails with an assertion error.

### Solution:
1. Verify that `site.config.js` has valid JavaScript syntax without missing commas or unmatched quotes.
2. Run the static syntax check:
   ```bash
   python3 test_runner.py
   ```
3. Check that the port is free and all files exist in their expected paths.
