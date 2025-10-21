"use client";

import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/core/shadcn/components/ui/form";
import { Input } from "@/core/shadcn/components/ui/input";
import { Button } from "@/core/shadcn/components/ui/button";
import { signUpFormSchema, SignUpFormValues } from "@/core/validators/sign-up";

import type { UserModel } from "@/model/user/user";
import { useUserStore } from "@/app/_stores/user/user-store";

export function SignUpForm() {
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      email: "",
      name: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: SignUpFormValues) => {
    try {
      const response = await fetch("/api/sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: values.email,
          password: values.password,
          name: values.name || null,
        }),
      });

      const result = (await response.json().catch(() => null)) as {
        user?: UserModel;
        error?: string;
      } | null;

      if (!response.ok || !result?.user) {
        throw new Error(
          result?.error ?? "회원가입에 실패했습니다. 다시 시도해주세요."
        );
      }

      setUser(result.user);

      toast.success("회원가입이 완료되었습니다.");
      form.reset();
      router.replace("/");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.";
      toast.error(message);
    }
  };

  const onError = (errors: FieldErrors<SignUpFormValues>) => {
    const extractMessage = (errorField: unknown): string | undefined => {
      if (!errorField) {
        return undefined;
      }

      if (
        typeof errorField === "object" &&
        "message" in (errorField as Record<string, unknown>) &&
        typeof (errorField as Record<string, unknown>).message === "string"
      ) {
        return (errorField as Record<string, unknown>).message as string;
      }

      if (typeof errorField === "object") {
        for (const value of Object.values(
          errorField as Record<string, unknown>
        )) {
          const message = extractMessage(value);
          if (message) {
            return message;
          }
        }
      }

      return undefined;
    };

    const message = extractMessage(errors);
    if (message) {
      toast.error(message);
    }
  };

  return (
    <Form {...form}>
      <form
        className="space-y-6"
        onSubmit={form.handleSubmit(onSubmit, onError)}
        noValidate
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이메일</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이름</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="홍길동"
                  autoComplete="name"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>비밀번호</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  autoComplete="new-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>비밀번호 확인</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="비밀번호를 다시 입력하세요"
                  autoComplete="new-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full"
        >
          {form.formState.isSubmitting ? "처리 중..." : "회원가입"}
        </Button>
      </form>
    </Form>
  );
}
