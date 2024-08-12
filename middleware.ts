import { getToken } from "next-auth/jwt";
import { NextResponse, NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.JWT_SECRET });
  const { pathname, origin } = req.nextUrl;
  if (token) {
    if (pathname !== "/login") return NextResponse.next();
    return NextResponse.redirect(origin);
  } else {
    if (pathname !== "/login")
      return NextResponse.redirect("http://localhost:3000/login");
  }
}

export const config = {
  matcher: [
    //  Match all request paths except for the ones starting with:- api (API routes)- _next/static (static files)- _next/image (image optimization files)- favicon.ico (favicon file)
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
