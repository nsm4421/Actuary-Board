import "reflect-metadata";
import { NextResponse } from "next/server";
import {
  signInAction,
  validateSignInRequest,
} from "@/controller/user/actions/sign-in";
import { toUserResponse } from "@/controller/user/serializers";
import type { LoginUserResponse } from "@/controller/user/dto";
import { InvalidCredentialsError } from "@/service/user/errors";
import { AUTH_COOKIE_NAME } from "@/controller/user/constants";

export async function POST(req: Request) {
  const body = await req.json();
  const validation = validateSignInRequest(body);
  if (!validation.success) {
    const message =
      validation.error.issues[0]?.message ?? "요청 값이 올바르지 않습니다.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    const user = await signInAction(validation.data);
    const response: LoginUserResponse = { user: toUserResponse(user) };
    const result = NextResponse.json(response, { status: 200 });
    result.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: user.id,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return result;
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      return NextResponse.json(
        { error: "이메일 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 },
      );
    }

    console.error("Failed to handle sign-in request", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
