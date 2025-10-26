import "reflect-metadata";
import { beforeEach, afterEach, describe, expect, it } from "vitest";
import { setupApiTest } from "@tests/api/setup";
import { POST as signUp } from "@/app/api/(auth)/sign-up/route";
import { POST as createArticle } from "@/app/api/article/route";
import type { CreateArticleResponse } from "@/app/api/article/route";
import { AUTH_COOKIE_NAME } from "@/controller/user/constants";

const jsonRequest = (
  url: string,
  data: unknown,
  options?: { authUserId?: string },
) =>
  new Request(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(options?.authUserId
        ? { Cookie: `${AUTH_COOKIE_NAME}=${options.authUserId}` }
        : {}),
    },
    body: JSON.stringify(data),
  });

const registerTestUser = async () => {
  const unique = Math.random().toString(36).slice(2);
  const payload = {
    email: `article-tester-${unique}@example.com`,
    password: "Password123!",
    username: `Article Tester ${unique}`,
  };

  const response = await signUp(
    jsonRequest("http://localhost/api/sign-up", payload),
  );
  const body = (await response.json()) as { user: { id: string } };
  return body.user.id;
};

describe("POST /api/article", () => {
  let cleanup: () => void;

  beforeEach(() => {
    cleanup = setupApiTest().cleanup;
  });

  afterEach(() => {
    cleanup?.();
  });

  it("creates an article when the user is authenticated", async () => {
    const authorId = await registerTestUser();
    const response = await createArticle(
      jsonRequest(
        "http://localhost/api/article",
        {
          title: "새 게시글",
          category: "free",
          content: "내용입니다.",
          isPublic: true,
        },
        { authUserId: authorId },
      ),
    );

    const body = (await response.json()) as CreateArticleResponse;

    expect(response.status).toBe(201);
    expect(body.article?.title).toBe("새 게시글");
    expect(body.article?.category).toBe("free");
    expect(body.article?.author?.id).toBe(authorId);
    expect(body.redirectTo).toBe(`/article/${body.article?.id}`);
  });

  it("returns 401 when the user is not authenticated", async () => {
    const response = await createArticle(
      jsonRequest("http://localhost/api/article", {
        title: "제목",
        category: "free",
        content: "내용",
        isPublic: true,
      }),
    );
    const body = (await response.json()) as { error?: string };

    expect(response.status).toBe(401);
    expect(body.error).toBeDefined();
  });

  it("validates payload and returns 400 for invalid body", async () => {
    const authorId = await registerTestUser();
    const response = await createArticle(
      jsonRequest(
        "http://localhost/api/article",
        {
          title: "",
          category: "free",
          content: "",
          isPublic: true,
        },
        { authUserId: authorId },
      ),
    );
    const body = (await response.json()) as { error?: string };

    expect(response.status).toBe(400);
    expect(body.error).toBeDefined();
  });
});
