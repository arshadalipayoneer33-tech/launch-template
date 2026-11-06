/**
 * Cloudflare Pages Function: /api/auth
 * DEMONSTRATION ENDPOINT ONLY
 *
 * IMPORTANT SECURITY NOTICE:
 * This endpoint is a client-architecture demonstration and is NOT intended for
 * production access control. In a production application, replace this mock
 * with a real identity provider (e.g. Supabase Auth, Clerk, Auth0) that
 * cryptographically verifies JSON Web Tokens (JWT) using asymmetric keys.
 */

export async function onRequestGet(context) {
  const { request, env } = context;
  const authHeader = request.headers.get("Authorization");

  const headers = {
    "Content-Type": "application/json",
    "X-Content-Type-Options": "nosniff",
  };

  // 1. Validate Authorization Header Format
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({
        authenticated: false,
        error: "Missing or malformed Authorization header. Expected 'Bearer <token>'.",
        isDemo: true,
      }),
      { status: 401, headers }
    );
  }

  const token = authHeader.split(" ")[1]?.trim();
  if (!token) {
    return new Response(
      JSON.stringify({
        authenticated: false,
        error: "Bearer token is empty.",
        isDemo: true,
      }),
      { status: 401, headers }
    );
  }

  // 2. Production Integration Path (Supabase Auth Example)
  if (env?.SUPABASE_URL && env?.SUPABASE_ANON_KEY) {
    try {
      const userRes = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: env.SUPABASE_ANON_KEY,
        },
      });

      if (userRes.ok) {
        const user = await userRes.json();
        return new Response(
          JSON.stringify({
            authenticated: true,
            isDemo: false,
            provider: "supabase",
            user: {
              id: user.id,
              email: user.email,
              role: user.role || "authenticated",
            },
          }),
          { status: 200, headers }
        );
      }
    } catch (err) {
      console.error("[Auth API] Supabase verification error:", err);
    }
  }

  // Never fall back to demo authentication when Supabase
// is configured or production mode is enabled.
if (
  env?.SUPABASE_URL ||
  env?.SUPABASE_ANON_KEY ||
  env?.NODE_ENV === "production" ||
  env?.AUTH_MODE === "production"
) {
  return new Response(
    JSON.stringify({
      authenticated: false,
      isDemo: false,
      error: "Authentication failed.",
    }),
    { status: 401, headers }
  );
}

  // 3. Demo Mode: Only accept the explicitly configured demo token
  const EXPECTED_DEMO_TOKEN = env?.DEMO_AUTH_TOKEN || "launchflow-demo-session-token-v1";

  if (token === EXPECTED_DEMO_TOKEN) {
    return new Response(
      JSON.stringify({
        authenticated: true,
        isDemo: true,
        warning: "DEMO MODE ONLY: Authenticated via static demo session token. Connect a production identity provider before launch.",
        user: {
          id: "demo_usr_founder",
          email: "demo@example.com",
          role: "demo_admin",
        },
      }),
      { status: 200, headers }
    );
  }

  // Reject all other tokens
  return new Response(
    JSON.stringify({
      authenticated: false,
      error: "Invalid token. For demo testing, provide the configured demo token.",
      isDemo: true,
    }),
    { status: 401, headers }
  );
}
