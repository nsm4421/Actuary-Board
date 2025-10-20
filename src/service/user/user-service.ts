import "reflect-metadata";
import type { User } from "@/db/schema/users";
import type {
  CreateUserInput,
  UpdateUserPasswordInput,
  UpdateUserProfileInput,
} from "@/repository/user/user-repository";

export interface UserService {
  register(input: CreateUserInput): Promise<User>;
  getByEmail(email: string): Promise<User | undefined>;
  getById(id: string): Promise<User | undefined>;
  changePassword(
    input: UpdateUserPasswordInput,
  ): Promise<User>;
  updateProfile(
    input: UpdateUserProfileInput,
  ): Promise<User>;
}
