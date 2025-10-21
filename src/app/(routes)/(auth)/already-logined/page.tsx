import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AUTH_COOKIE_NAME } from "@/controller/user/constants";
import { BackButton } from "@/app/_components/back-button";
import { SignOutButton } from "@/app/_components/sign-out-button";
import { Button } from "@/core/shadcn/components/ui/button";

export default async function AlreadyLoginedPage() {
  const cookieStore = await cookies();
  if (!cookieStore.has(AUTH_COOKIE_NAME)) {
    redirect("/sign-in");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-8 rounded-lg border border-border bg-card p-8 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">이미 로그인되어 있습니다</h1>
          <p className="text-sm text-muted-foreground">
            다른 계정으로 사용하려면 로그아웃을 진행하거나 홈으로 이동해주세요.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <BackButton />

          <Button asChild className="w-full">
            <Link href="/">홈으로 이동</Link>
          </Button>

          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
