/**
 * Cloudflare Pages Function: /api/data
 * CRUD API handler demonstrating serverless persistence.
 * Can be connected to Cloudflare D1 (free SQLite edge DB), KV, or Supabase.
 */

// In-memory demo store for edge demonstration
let inMemoryStore = [
  { id: "1", title: "Launch MVP on Cloudflare Pages", status: "Completed", createdAt: new Date().toISOString() },
  { id: "2", title: "Validate first $100 service offer", status: "In Progress", createdAt: new Date().toISOString() },
];

export async function onRequestGet() {
  return new Response(
    JSON.stringify({ success: true, count: inMemoryStore.length, items: inMemoryStore }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}

export async function onRequestPost(context) {
  const { request } = context;

  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
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
      id: "item_" + Date.now(),
      title: body.title.trim().replace(/[<>]/g, ""),
      status: body.status || "Active",
      createdAt: new Date().toISOString(),
    };

    inMemoryStore.unshift(newItem);

    return new Response(
      JSON.stringify({ success: true, message: "Item saved to edge data store.", item: newItem }),
      { status: 201, headers }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: "Invalid JSON." }),
      { status: 400, headers }
    );
  }
}
