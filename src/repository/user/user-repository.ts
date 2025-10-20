import "reflect-metadata";
import { type User } from "@/db/schema/users";

export interface CreateUserInput {
  email: string;
  hashedPassword: string;
  name?: string | null;
}

export interface UpdateUserPasswordInput {
  id: string;
  hashedPassword: string;
}

export interface UpdateUserProfileInput {
  id: string;
  name: string | null;
}

export interface UserRepository {
  create(input: CreateUserInput): Promise<User>;
  findByEmail(email: string): Promise<User | undefined>;
  findById(id: string): Promise<User | undefined>;
  updatePassword(input: UpdateUserPasswordInput): Promise<User | undefined>;
  updateProfile(input: UpdateUserProfileInput): Promise<User | undefined>;
}
