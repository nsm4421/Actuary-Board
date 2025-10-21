import type { User } from "@/db/schema/users";
import type { UserProfile } from "@/db/schema/user-profiles";

export interface CreateUserInput {
  email: string;
  hashedPassword: string;
  username: string;
  bio?: string | null;
  avatarUrl?: string | null;
}

export interface UpdateUserPasswordInput {
  id: string;
  hashedPassword: string;
}

export interface UpdateUserProfileInput {
  id: string;
  username?: string;
  bio?: string | null;
  avatarUrl?: string | null;
}

export type UserWithProfile = User & {
  profile: UserProfile | null;
};

export interface UserRepository {
  create(input: CreateUserInput): Promise<UserWithProfile>;
  findByEmail(email: string): Promise<UserWithProfile | undefined>;
  findById(id: string): Promise<UserWithProfile | undefined>;
  updatePassword(
    input: UpdateUserPasswordInput,
  ): Promise<UserWithProfile | undefined>;
  updateProfile(
    input: UpdateUserProfileInput,
  ): Promise<UserWithProfile | undefined>;
}
