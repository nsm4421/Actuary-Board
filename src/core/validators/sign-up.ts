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

const formNameSchema = z
  .string()
  .trim()
  .max(50, "이름은 50자 이하로 입력해주세요.")
  .optional()
  .or(z.literal(""));

const requestNameSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => {
    if (!value) {
      return null;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  });

export const signUpFormSchema = z
  .object({
    email: baseEmailSchema,
    name: formNameSchema,
    password: basePasswordSchema,
    confirmPassword: z
      .string()
      .min(1, "비밀번호 확인을 입력해주세요."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "비밀번호가 일치하지 않습니다.",
  });

export type SignUpFormValues = z.infer<typeof signUpFormSchema>;

export const signUpRequestSchema = z.object({
  email: baseEmailSchema.transform((value) => value.toLowerCase()),
  password: basePasswordSchema,
  name: requestNameSchema,
});

export type SignUpRequest = z.infer<typeof signUpRequestSchema>;
