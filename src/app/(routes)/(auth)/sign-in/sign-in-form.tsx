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
import {
  signInFormSchema,
  type SignInFormValues,
} from "@/core/validators/sign-in";

import type { UserModel } from "@/model/user/user";
import { useUserStore } from "@/app/_stores/user/user-store";

export function SignInForm() {
  const router = useRouter();
  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const setUser = useUserStore((state) => state.setUser);

  const onSubmit = async (values: SignInFormValues) => {
    try {
      const response = await fetch("/api/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });

      const result = (await response.json().catch(() => null)) as
        | { user?: UserModel; error?: string }
        | null;

      if (!response.ok || !result?.user) {
        throw new Error(
          result?.error ?? "로그인에 실패했습니다. 다시 시도해주세요.",
        );
      }

      setUser(result.user);

      toast.success("로그인에 성공했습니다.");
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

  const onError = (errors: FieldErrors<SignInFormValues>) => {
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
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>비밀번호</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  autoComplete="current-password"
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
          {form.formState.isSubmitting ? "처리 중..." : "로그인"}
        </Button>
      </form>
    </Form>
  );
}
