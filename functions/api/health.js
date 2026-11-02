/**
 * Cloudflare Pages Function: /api/health
 * Returns API system status, edge region, and timestamp
 */
export async function onRequestGet(context) {
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store, no-cache, must-revalidate",
    "Access-Control-Allow-Origin": "*",
  };

  const statusPayload = {
    status: "healthy",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    uptime: "99.99%",
    region: context.request.cf ? context.request.cf.colo : "local-edge",
    service: "LaunchFlow Edge API",
  };

  return new Response(JSON.stringify(statusPayload, null, 2), {
    status: 200,
    headers,
  });
}
