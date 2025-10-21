import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/controller/user/constants";

const AUTH_GUARDED_PATHS = ["/sign-in", "/sign-up"];
const ALREADY_LOGINED_PATH = "/already-logined";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasAuthCookie = request.cookies.has(AUTH_COOKIE_NAME); // 로그인 여부는 cookie의 인증정보로 판단

  // 로그인되있는데 /sign-in, /sign-up 경로로 접근하는 경우 → /already-logined로 리다이렉션
  if (AUTH_GUARDED_PATHS.includes(pathname) && hasAuthCookie) {
    const url = request.nextUrl.clone();
    url.pathname = ALREADY_LOGINED_PATH;
    return NextResponse.redirect(url);
  }
  // 로그인은 안되었는데 /already-logined 경로로 접근하는 경우 → /sign-in로 라디이렉션
  else if (pathname === ALREADY_LOGINED_PATH && !hasAuthCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/sign-in", "/sign-up", "/already-logined"],
};
