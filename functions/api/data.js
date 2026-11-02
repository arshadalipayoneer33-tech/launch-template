/**
 * Cloudflare Pages Function: /api/data
 * DEMONSTRATION IN-MEMORY STORE ONLY
 *
 * IMPORTANT LIMITATIONS:
 * 1. Data is held in volatile serverless memory and is NOT persistent across
 *    edge isolate recycles or across different edge data centers.
 * 2. This endpoint provides NO multi-tenant isolation or private data guarantees.
 * 3. For real applications, connect this route to a persistent database such as
 *    Cloudflare D1 (Serverless SQLite), Supabase (PostgreSQL), or Firebase.
 */

// Volatile in-memory demo store
let demoInMemoryStore = [
  { id: "1", title: "Launch MVP on Cloudflare Pages", status: "Completed", createdAt: new Date().toISOString() },
  { id: "2", title: "Validate first $100 service offer", status: "In Progress", createdAt: new Date().toISOString() },
];

export async function onRequestGet() {
  const headers = {
    "Content-Type": "application/json",
    "X-Content-Type-Options": "nosniff",
  };

  return new Response(
    JSON.stringify({
      success: true,
      isDemoStore: true,
      storageType: "ephemeral-in-memory",
      warning: "DEMO DATA STORE: Data is held in volatile memory and is neither persistent nor private. Connect a database (e.g. Supabase, Cloudflare D1) for production storage.",
      count: demoInMemoryStore.length,
      items: demoInMemoryStore,
    }),
    { status: 200, headers }
  );
}

export async function onRequestPost(context) {
  const { request } = context;

  const headers = {
    "Content-Type": "application/json",
    "X-Content-Type-Options": "nosniff",
  };

  try {
    const body = await request.json();
    if (!body.title || typeof body.title !== "string" || body.title.trim().length < 3) {
      return new Response(
        JSON.stringify({ success: false, error: "Title must be at least 3 characters." }),
        { status: 400, headers }
      );
    }

    const newItem = {
      id: "demo_" + Date.now(),
      title: body.title.trim().replace(/[<>]/g, ""),
      status: body.status || "Active",
      createdAt: new Date().toISOString(),
    };

    demoInMemoryStore.unshift(newItem);

    return new Response(
      JSON.stringify({
        success: true,
        isDemoStore: true,
        storageType: "ephemeral-in-memory",
        message: "Item saved to ephemeral demo memory. (Will reset on serverless restart).",
        item: newItem,
      }),
      { status: 201, headers }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: "Invalid JSON payload." }),
      { status: 400, headers }
    );
  }
}
