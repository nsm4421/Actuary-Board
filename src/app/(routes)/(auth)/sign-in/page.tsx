import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/core/shadcn/components/ui/card";
import type { Metadata } from "next";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = {
  title: "로그인",
  description: "계정에 로그인하세요.",
};

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-semibold">로그인</CardTitle>
          <CardDescription>계정 정보를 입력하고 로그인하세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <SignInForm />
        </CardContent>
      </Card>
    </div>
  );
}
