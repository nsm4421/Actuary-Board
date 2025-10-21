"use client";

import { SignOutButton } from "@/app/_components/sign-out-button";
import { useUserStore } from "../../_stores/user/user-store";


export default function Home() {
  const user = useUserStore((state) => state.user);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4">
      <h1 className="text-3xl font-semibold">
        {user ? `${user.email}님 환영합니다` : "환영합니다"}
      </h1>

      {user ? (
        <div className="text-center text-sm text-muted-foreground">
          <p>이름: {user.name ?? "등록되지 않음"}</p>
          <p>가입일: {new Date(user.createdAt).toLocaleString()}</p>
        </div>
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          로그인 후 더 많은 기능을 이용해보세요.
        </p>
      )}

      <div className="w-full max-w-xs">
        <SignOutButton />
      </div>
    </div>
  );
}
