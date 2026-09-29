import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Passcode gate for the prototype. Set PASSCODE in the environment (Vercel →
 * Settings → Environment Variables). Leave it unset to open the app to anyone.
 */
export function proxy(request: NextRequest) {
  const passcode = process.env.PASSCODE;
  if (!passcode) return NextResponse.next();

  const { pathname, searchParams } = request.nextUrl;
  if (pathname === "/gate" || pathname.startsWith("/api/gate")) return NextResponse.next();

  // ?key=... in the shared link sets the cookie once, so friends never see the gate.
  const key = searchParams.get("key");
  if (key === passcode) {
    const url = request.nextUrl.clone();
    url.searchParams.delete("key");
    const res = NextResponse.redirect(url);
    res.cookies.set("cfo_pass", passcode, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 90 });
    return res;
  }

  if (request.cookies.get("cfo_pass")?.value === passcode) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/gate";
  url.search = `?next=${encodeURIComponent(pathname)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/|icons/|sw\\.js|manifest\\.webmanifest|favicon\\.ico).*)"],
};
