import "reflect-metadata";
import { NextResponse } from "next/server";
import { signUpAction, validateSignUpRequest } from "@/controller/user/actions/sign-up";
import { toUserResponse } from "@/controller/user/serializers";
import type { RegisterUserResponse } from "@/controller/user/dto";
import { AUTH_COOKIE_NAME } from "@/controller/user/constants";

export async function POST(req: Request) {
  const body = await req.json();
  const validation = validateSignUpRequest(body);
  if (!validation.success) {
    const message =
      validation.error.issues[0]?.message ?? "요청 값이 올바르지 않습니다.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    const user = await signUpAction(validation.data);
    const response: RegisterUserResponse = { user: toUserResponse(user) };
    const result = NextResponse.json(response, { status: 201 });
    result.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: user.id,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return result;
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.toLowerCase().includes("already exists")
    ) {
      return NextResponse.json(
        { error: "이미 등록된 이메일입니다." },
        { status: 409 }
      );
    }

    console.error("Failed to handle sign-up request", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
