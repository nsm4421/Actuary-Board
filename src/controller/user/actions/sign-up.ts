import { resolveUserController } from "@/controller/di";
import {
  SignUpRequest,
  signUpRequestSchema,
} from "@/core/validators/sign-up";

export function validateSignUpRequest(input: unknown) {
  return signUpRequestSchema.safeParse(input);
}

export async function signUpAction(data: SignUpRequest) {
  const controller = resolveUserController();
  return controller.register({
    email: data.email,
    password: data.password,
    name: data.name,
  });
}
