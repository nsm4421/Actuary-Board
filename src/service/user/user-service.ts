import "reflect-metadata";
import type { UserModel } from "@/model/user/user";

export interface RegisterUserInput {
  email: string;
  password: string;
  username: string;
  bio?: string | null;
  avatarUrl?: string | null;
}

export interface ChangeUserPasswordInput {
  userId: string;
  password: string;
}

export interface UpdateUserProfileInput {
  userId: string;
  username?: string;
  bio?: string | null;
  avatarUrl?: string | null;
}

export interface UserService {
  register(input: RegisterUserInput): Promise<UserModel>;
  getByEmail(email: string): Promise<UserModel | undefined>;
  getById(id: string): Promise<UserModel | undefined>;
  authenticate(email: string, password: string): Promise<UserModel>;
  changePassword(input: ChangeUserPasswordInput): Promise<UserModel>;
  updateProfile(input: UpdateUserProfileInput): Promise<UserModel>;
}
