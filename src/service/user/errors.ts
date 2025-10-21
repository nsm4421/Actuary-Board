import { InvalidPasswordHashError } from "@/core/errors/password";

export class InvalidCredentialsError extends Error {
  constructor() {
    super("Invalid credentials");
    this.name = "InvalidCredentialsError";
  }
}

export { InvalidPasswordHashError };
