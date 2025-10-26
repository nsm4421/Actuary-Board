import "reflect-metadata";
import { NextResponse } from "next/server";
import {
  createArticleAction,
  validateCreateArticleRequest,
} from "@/controller/article/actions/create-article";
import { AUTH_COOKIE_NAME } from "@/controller/user/constants";

export type CreateArticleResponse = {
  article?: { id: string };
  redirectTo?: string;
  error?: string;
};

const getAuthorIdFromRequest = (request: Request): string | undefined => {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) {
    return undefined;
  }

  const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());
  for (const cookie of cookies) {
    if (!cookie) continue;
    const [name, ...rest] = cookie.split("=");
    if (name === AUTH_COOKIE_NAME) {
      return rest.join("=");
    }
  }

  return undefined;
};

export async function POST(request: Request) {
  const authorId = getAuthorIdFromRequest(request);

  if (!authorId) {
    return NextResponse.json(
      { error: "로그인이 필요합니다." },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "유효하지 않은 요청 본문입니다." },
      { status: 400 },
    );
  }

  const validation = validateCreateArticleRequest(body);
  if (!validation.success) {
    const message =
      validation.error.issues[0]?.message ?? "요청 값이 올바르지 않습니다.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    const article = await createArticleAction(authorId, validation.data);
    const redirectTo = `/article/${article.id}`;
    return NextResponse.json({ article, redirectTo }, { status: 201 });
  } catch (error) {
    console.error("Failed to handle article creation request", error);
    return NextResponse.json(
      { error: "게시글 생성 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
