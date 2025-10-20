import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/core/shadcn/components/ui/card";
import { SignUpForm } from "./sign-up-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "회원가입",
  description: "이메일과,비밀번호로 회원가입처리",
};

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-semibold">회원가입</CardTitle>
          <CardDescription>정보를 입력하고 계정을 생성하세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <SignUpForm />
        </CardContent>
      </Card>
    </div>
  );
}
