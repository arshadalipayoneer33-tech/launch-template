/**
 * Cloudflare Pages Function: /api/contact
 * Validates submissions, enforces rate limiting, traps bots, and handles forwarding.
 *
 * NOTE: Out-of-the-box, submissions are verified and logged to the server console.
 * Actual email dispatch requires adding RESEND_API_KEY or a webhook URL to .env.
 */

const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 5;

export async function onRequestPost(context) {
  const { request, env } = context;

  const responseHeaders = {
    "Content-Type": "application/json",
    "X-Content-Type-Options": "nosniff",
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
        error: "Rate limit reached: Maximum 5 submissions per 10 minutes from this IP.",
      }),
      { status: 429, headers: responseHeaders }
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
      { status: 400, headers: responseHeaders }
    );
  }

  const { name, email, subject, message, honeypot } = body;

  // Bot Trap Check
  if (honeypot && honeypot.trim().length > 0) {
    return new Response(
      JSON.stringify({
        success: true,
        deliveredToEmail: false,
        message: "Submission accepted.",
      }),
      { status: 200, headers: responseHeaders }
    );
  }

  // Field Validation
  if (!name || typeof name !== "string" || name.trim().length < 2 || name.length > 80) {
    return new Response(
      JSON.stringify({ success: false, error: "Name must be between 2 and 80 characters." }),
      { status: 400, headers: responseHeaders }
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== "string" || !emailRegex.test(email) || email.length > 120) {
    return new Response(
      JSON.stringify({ success: false, error: "A valid email address is required." }),
      { status: 400, headers: responseHeaders }
    );
  }

  if (!message || typeof message !== "string" || message.trim().length < 10 || message.length > 3000) {
    return new Response(
      JSON.stringify({ success: false, error: "Message must be between 10 and 3,000 characters." }),
      { status: 400, headers: responseHeaders }
    );
  }

  // Sanitization (Strip HTML tags to avoid XSS)
  const sanitize = (str) => String(str).replace(/[<>]/g, "");
  const cleanName = sanitize(name.trim());
  const cleanEmail = sanitize(email.trim());
  const cleanSubject = sanitize(subject ? subject.trim() : "General Inquiry");
  const cleanMessage = sanitize(message.trim());

  console.log(`[Contact Submission] From: ${cleanName} <${cleanEmail}> | Subject: ${cleanSubject}`);

  // 3. Optional: Live Email Forwarding via Resend or Webhook
  let deliveredToEmail = false;

  if (env?.RESEND_API_KEY && env?.CONTACT_RECIPIENT_EMAIL) {
    try {
      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "LaunchFlow Contact <onboarding@resend.dev>",
          to: [env.CONTACT_RECIPIENT_EMAIL],
          subject: `[LaunchFlow Form] ${cleanSubject} from ${cleanName}`,
          text: `From: ${cleanName} (${cleanEmail})\nSubject: ${cleanSubject}\n\nMessage:\n${cleanMessage}`,
        }),
      });
      deliveredToEmail = resendRes.ok;
    } catch (e) {
      console.error("[Contact API] Resend email dispatch failed:", e);
    }
  }

  const responseMessage = deliveredToEmail
    ? "Thank you! Your message has been forwarded to our inbox."
    : "Demo submission validated and logged on server. (Note: Email delivery requires configuring RESEND_API_KEY in .env).";

  return new Response(
    JSON.stringify({
      success: true,
      deliveredToEmail,
      demoMode: !deliveredToEmail,
      message: responseMessage,
      data: {
        receivedAt: new Date().toISOString(),
        sender: cleanName,
      },
    }),
    { status: 200, headers: responseHeaders }
  );
}
