import "reflect-metadata";
import { NextResponse } from "next/server";
import { signUpAction, validateSignUpRequest } from "@/controller/user/actions/sign-up";

const serializeUser = (user: {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date | number;
  updatedAt: Date | number;
}) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  createdAt: new Date(user.createdAt).toISOString(),
  updatedAt: new Date(user.updatedAt).toISOString(),
});

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
    return NextResponse.json({ user: serializeUser(user) }, { status: 201 });
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
