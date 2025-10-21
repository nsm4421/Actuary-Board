import "reflect-metadata";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/controller/user/constants";

export async function POST() {
  const response = NextResponse.json(
    { message: "로그아웃 되었습니다." },
    { status: 200 },
  );
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    maxAge: 0,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  return response;
}
