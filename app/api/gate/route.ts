import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const form = await request.formData();
  const code = String(form.get("code") ?? "").trim();
  const next = String(form.get("next") ?? "/home");
  const passcode = process.env.PASSCODE;

  if (!passcode || code === passcode) {
    const res = NextResponse.redirect(new URL(next.startsWith("/") ? next : "/home", request.url), 303);
    res.cookies.set("cfo_pass", passcode ?? "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 90 });
    return res;
  }
  return NextResponse.redirect(new URL(`/gate?error=1&next=${encodeURIComponent(next)}`, request.url), 303);
}
