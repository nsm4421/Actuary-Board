import { cookies } from "next/headers";
import Link from "next/link";
import { AUTH_COOKIE_NAME } from "@/controller/user/constants";
import { BackButton } from "@/app/_components/back-button";
import { Button } from "@/core/shadcn/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/core/shadcn/components/ui/card";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default async function AuthGuardProvider({ children }: Props) {
  const cookieStore = await cookies();
  if (!cookieStore.has(AUTH_COOKIE_NAME)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl font-semibold">
              로그인이 필요합니다
            </CardTitle>
            <CardDescription>
              게시글을 작성하려면 로그인 후 다시 시도해주세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <BackButton />
            <Button asChild className="w-full">
              <Link href="/sign-in">로그인하러 가기</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  return children;
}
