import { getToken } from "next-auth/jwt";
import { NextResponse, NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.JWT_SECRET });
  const url = process.env.NEXTAUTH_URL;
  const loginUrl = url + "login";

  const { pathname, origin } = req.nextUrl;
  if (token) {
    if (pathname !== "/login") return NextResponse.next();
    return NextResponse.redirect(origin);
  } else {
    if (pathname !== "/login") return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
