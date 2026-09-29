import { NextResponse } from "next/server";

/**
 * Feedback sink. For now it logs to the server console (visible in Vercel → Logs).
 * Swap the body for a Vercel KV / Google Sheet webhook when notes need to persist.
 */
export async function POST(request: Request) {
  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  console.log("[feedback]", JSON.stringify({ at: new Date().toISOString(), ...(body as object) }));
  return NextResponse.json({ ok: true });
}
