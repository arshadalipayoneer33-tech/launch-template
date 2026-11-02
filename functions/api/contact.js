/**
 * Cloudflare Pages Function: /api/contact
 * Handles contact form submissions with input validation, sanitization,
 * honeypot bot trap, and in-memory rate limiting.
 */

// Simple edge in-memory rate limiter cache (maps IP -> array of timestamps)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 5;

export async function onRequestPost(context) {
  const { request, env } = context;

  const corsHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // 1. IP Extraction and Rate Limiting
  const clientIp = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "127.0.0.1";
  const now = Date.now();

  const userRequests = rateLimitMap.get(clientIp) || [];
  const recentRequests = userRequests.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);

  if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Too many messages sent from your IP. Please wait 10 minutes before trying again.",
      }),
      { status: 429, headers: corsHeaders }
    );
  }

  recentRequests.push(now);
  rateLimitMap.set(clientIp, recentRequests);

  // 2. Parse and Validate Request Body
  let body;
  try {
    body = await request.json();
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: "Invalid JSON payload." }),
      { status: 400, headers: corsHeaders }
    );
  }

  const { name, email, subject, message, honeypot } = body;

  // Bot Trap Check
  if (honeypot && honeypot.trim().length > 0) {
    // Silently reject or simulate success to avoid alerting bots
    return new Response(
      JSON.stringify({ success: true, message: "Thank you for your message." }),
      { status: 200, headers: corsHeaders }
    );
  }

  // Field Validation
  if (!name || typeof name !== "string" || name.trim().length < 2 || name.length > 80) {
    return new Response(
      JSON.stringify({ success: false, error: "Name must be between 2 and 80 characters." }),
      { status: 400, headers: corsHeaders }
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== "string" || !emailRegex.test(email) || email.length > 120) {
    return new Response(
      JSON.stringify({ success: false, error: "A valid email address is required." }),
      { status: 400, headers: corsHeaders }
    );
  }

  if (!message || typeof message !== "string" || message.trim().length < 10 || message.length > 3000) {
    return new Response(
      JSON.stringify({ success: false, error: "Message must be between 10 and 3,000 characters." }),
      { status: 400, headers: corsHeaders }
    );
  }

  // Sanitization (Strip HTML tags to avoid XSS in logs or notification forwarding)
  const sanitize = (str) => String(str).replace(/[<>]/g, "");
  const cleanName = sanitize(name.trim());
  const cleanEmail = sanitize(email.trim());
  const cleanSubject = sanitize(subject ? subject.trim() : "General Inquiry");
  const cleanMessage = sanitize(message.trim());

  /**
   * OPTIONAL: Forward to Discord Webhook, Slack Webhook, or SendGrid email if configured in env vars
   * e.g., if (env.DISCORD_WEBHOOK_URL) { await fetch(env.DISCORD_WEBHOOK_URL, { ... }); }
   */
  console.log(`[Contact Submission] From: ${cleanName} <${cleanEmail}> | Subject: ${cleanSubject}`);

  return new Response(
    JSON.stringify({
      success: true,
      message: "Thank you! Your message has been received securely.",
      data: {
        receivedAt: new Date().toISOString(),
        sender: cleanName,
      },
    }),
    { status: 200, headers: corsHeaders }
  );
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
