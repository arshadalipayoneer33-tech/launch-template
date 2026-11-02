/**
 * Cloudflare Pages Function: /api/auth
 * Demonstrates a protected server-side authentication check.
 * Pre-wired to support Supabase JWT verification or mock sessions.
 */

export async function onRequestGet(context) {
  const { request, env } = context;

  const authHeader = request.headers.get("Authorization");

  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  };

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({
        authenticated: false,
        error: "Missing or malformed Authorization header. Expected 'Bearer <token>'.",
      }),
      { status: 401, headers }
    );
  }

  const token = authHeader.split(" ")[1];

  // If using Supabase, you can verify token against Supabase /auth/v1/user
  // if (env.SUPABASE_URL && env.SUPABASE_ANON_KEY) { ... }

  // Demo Token Handler
  if (token === "demo-token" || token.startsWith("usr_") || token.length > 10) {
    return new Response(
      JSON.stringify({
        authenticated: true,
        user: {
          id: "usr_demo_123",
          email: "founder@example.com",
          role: "admin",
          sessionExpires: new Date(Date.now() + 86400000).toISOString(),
        },
      }),
      { status: 200, headers }
    );
  }

  return new Response(
    JSON.stringify({ authenticated: false, error: "Invalid token." }),
    { status: 403, headers }
  );
}
