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

const formUsernameSchema = z
  .string()
  .trim()
  .min(1, "사용자명을 입력해주세요.")
  .max(50, "사용자명은 50자 이하로 입력해주세요.");

const formBioSchema = z
  .string()
  .trim()
  .max(30, "자기소개는 30자 이하로 입력해주세요.")
  .optional()
  .or(z.literal(""));

const requestUsernameSchema = z
  .string()
  .trim()
  .min(1, "사용자명을 입력해주세요.")
  .max(50, "사용자명은 50자 이하로 입력해주세요.");

const optionalBioSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value, ctx) => {
    if (value === undefined || value === null) {
      return null;
    }
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return null;
    }
    if (trimmed.length > 30) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_big,
        maximum: 30,
        type: "string",
        inclusive: true,
        origin: "string",
        message: "자기소개는 30자 이하로 입력해주세요.",
      });
      return z.NEVER;
    }
    return trimmed;
  });

const optionalTextSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => {
    if (value === undefined || value === null) {
      return null;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  });

export const signUpFormSchema = z
  .object({
    email: baseEmailSchema,
    username: formUsernameSchema,
    bio: formBioSchema,
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
  username: requestUsernameSchema,
  bio: optionalBioSchema,
  avatarUrl: optionalTextSchema,
});

export type SignUpRequest = z.infer<typeof signUpRequestSchema>;
