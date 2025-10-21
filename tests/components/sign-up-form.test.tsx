import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import { SignUpForm } from "@/app/(routes)/(auth)/sign-up/sign-up-form";
import { toast } from "sonner";

const setUserMock = vi.fn();
const routerReplaceMock = vi.fn();

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: routerReplaceMock,
  }),
}));

vi.mock("@/app/_stores/user/user-store", () => ({
  useUserStore: (selector: (state: { setUser: typeof setUserMock }) => unknown) =>
    selector({ setUser: setUserMock }),
}));

const renderForm = () => render(<SignUpForm />);

describe("SignUpForm", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("handles successful registration and redirects home", async () => {
    const user = userEvent.setup();
    const payload = {
      user: {
        id: "id-1",
        email: "test@example.com",
        name: "Test User",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(payload), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    ) as unknown as typeof fetch;

    renderForm();

    await user.type(screen.getByPlaceholderText("you@example.com"), "test@example.com");
    await user.type(screen.getByPlaceholderText("홍길동"), "Test User");
    await user.type(
      screen.getByPlaceholderText("비밀번호를 입력하세요"),
      "Password123!",
    );
    await user.type(
      screen.getByPlaceholderText("비밀번호를 다시 입력하세요"),
      "Password123!",
    );

    await user.click(screen.getByRole("button", { name: "회원가입" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/sign-up",
        expect.objectContaining({
          method: "POST",
          credentials: "include",
        }),
      );
      expect(setUserMock).toHaveBeenCalledWith(payload.user);
      expect(toast.success).toHaveBeenCalledWith("회원가입이 완료되었습니다.");
      expect(routerReplaceMock).toHaveBeenCalledWith("/");
    });
  });

  it("shows error toast when server returns failure", async () => {
    const user = userEvent.setup();

    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: "이미 등록된 이메일입니다." }), {
        status: 409,
        headers: { "Content-Type": "application/json" },
      }),
    ) as unknown as typeof fetch;

    renderForm();

    await user.type(screen.getByPlaceholderText("you@example.com"), "test@example.com");
    await user.type(screen.getByPlaceholderText("홍길동"), "Test User");
    await user.type(
      screen.getByPlaceholderText("비밀번호를 입력하세요"),
      "Password123!",
    );
    await user.type(
      screen.getByPlaceholderText("비밀번호를 다시 입력하세요"),
      "Password123!",
    );

    await user.click(screen.getByRole("button", { name: "회원가입" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "이미 등록된 이메일입니다.",
      );
      expect(routerReplaceMock).not.toHaveBeenCalled();
      expect(setUserMock).not.toHaveBeenCalled();
    });
  });
});
