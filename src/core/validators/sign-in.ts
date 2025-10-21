import { z } from "zod";

const baseEmailSchema = z
  .string()
  .trim()
  .min(1, "이메일을 입력해주세요.")
  .email("올바른 이메일 형식을 입력해주세요.");

const basePasswordSchema = z
  .string()
  .min(8, "비밀번호는 최소 8자 이상이어야 합니다.")
  .max(64, "비밀번호는 최대 64자까지 가능합니다.");

export const signInFormSchema = z.object({
  email: baseEmailSchema,
  password: basePasswordSchema,
});

export type SignInFormValues = z.infer<typeof signInFormSchema>;

export const signInRequestSchema = z.object({
  email: baseEmailSchema.transform((value) => value.toLowerCase()),
  password: basePasswordSchema,
});

export type SignInRequest = z.infer<typeof signInRequestSchema>;
