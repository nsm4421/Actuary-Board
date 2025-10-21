"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/core/shadcn/components/ui/button";
import { useRouter } from "next/navigation";
import { useUserStore } from "../_stores/user/user-store";


export function SignOutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const clearUser = useUserStore((state) => state.clearUser);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/sign-out", {
        method: "POST",
      });

      const result = (await response.json().catch(() => null)) as
        | { message?: string; error?: string }
        | null;

      if (!response.ok) {
        throw new Error(
          result?.error ?? "로그아웃에 실패했습니다. 다시 시도해주세요.",
        );
      }

      toast.success(result?.message ?? "로그아웃 되었습니다.");
      clearUser();
      router.replace("/sign-in");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleSignOut}
      disabled={isLoading}
      className="w-full"
      variant="outline"
    >
      {isLoading ? "처리 중..." : "로그아웃"}
    </Button>
  );
}
