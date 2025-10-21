import { resolveUserController } from "@/controller/di";
import {
  type SignInRequest,
  signInRequestSchema,
} from "@/core/validators/sign-in";

export function validateSignInRequest(input: unknown) {
  return signInRequestSchema.safeParse(input);
}

export async function signInAction(data: SignInRequest) {
  const controller = resolveUserController();
  return controller.login({
    email: data.email,
    password: data.password,
  });
}
