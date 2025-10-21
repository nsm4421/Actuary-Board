import "reflect-metadata";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { setupApiTest } from "@tests/api/setup";
import { POST as signUp } from "@/app/api/sign-up/route";
import { POST as signIn } from "@/app/api/sign-in/route";
import { POST as signOut } from "@/app/api/sign-out/route";

const jsonRequest = (url: string, data: unknown) =>
  new Request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

describe("Auth API routes", () => {
  let cleanup: () => void;

  beforeEach(() => {
    cleanup = setupApiTest().cleanup;
  });

  afterEach(() => {
    cleanup?.();
  });

  describe("POST /api/sign-up", () => {
    it("registers a user and sets auth cookie", async () => {
      const request = jsonRequest("http://localhost/api/sign-up", {
        email: "TestUser@example.com",
        password: "Password123!",
        username: "Test User",
      });

      const response = await signUp(request);
      const body = (await response.json()) as { user?: { email: string } };
      const cookieHeader = response.headers.get("set-cookie") ?? "";

      expect(response.status).toBe(201);
      expect(body.user?.email).toBe("testuser@example.com");
      expect(cookieHeader).toContain("auth_user=");
    });

    it("prevents registering with duplicate email", async () => {
      const payload = {
        email: "duplicate@example.com",
        password: "Password123!",
        username: "User",
      };

      await signUp(jsonRequest("http://localhost/api/sign-up", payload));
      const duplicateResponse = await signUp(
        jsonRequest("http://localhost/api/sign-up", payload),
      );

      expect(duplicateResponse.status).toBe(409);
    });

    it("returns validation error for invalid payload", async () => {
      const request = jsonRequest("http://localhost/api/sign-up", {
        email: "not-an-email",
        password: "short",
        username: "User",
      });

      const response = await signUp(request);
      const body = (await response.json()) as { error?: string };

      expect(response.status).toBe(400);
      expect(body.error).toBeDefined();
    });
  });

  describe("POST /api/sign-in", () => {
    it("signs in an existing user and sets cookie", async () => {
      const email = "login@example.com";
      const password = "Password123!";
      await signUp(
        jsonRequest("http://localhost/api/sign-up", {
          email,
          password,
          username: "User",
        }),
      );

      const response = await signIn(
        jsonRequest("http://localhost/api/sign-in", {
          email,
          password,
        }),
      );
      const body = (await response.json()) as { user?: { email: string } };
      const cookieHeader = response.headers.get("set-cookie") ?? "";

      expect(response.status).toBe(200);
      expect(body.user?.email).toBe(email);
      expect(cookieHeader).toContain("auth_user=");
    });

    it("rejects sign in with wrong password", async () => {
      const email = "wrongpass@example.com";
      await signUp(
        jsonRequest("http://localhost/api/sign-up", {
          email,
          password: "Password123!",
          username: "User",
        }),
      );

      const response = await signIn(
        jsonRequest("http://localhost/api/sign-in", {
          email,
          password: "WrongPassword!",
        }),
      );

      expect(response.status).toBe(401);
    });
  });

  describe("POST /api/sign-out", () => {
    it("clears auth cookie on sign out", async () => {
      const response = await signOut();
      const cookieHeader = response.headers.get("set-cookie") ?? "";

      expect(response.status).toBe(200);
      expect(cookieHeader).toContain("auth_user=");
      expect(cookieHeader).toContain("Max-Age=0");
    });
  });
});
