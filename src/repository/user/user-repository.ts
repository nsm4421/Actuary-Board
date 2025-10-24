import type { User } from "@/db/schema/users";
import type { UserProfile } from "@/db/schema/user-profiles";

export interface InsertUserInput {
  id: string;
  email: string;
  hashedPassword: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertUserProfileInput {
  userId: string;
  username: string;
  bio?: string | null;
  avatarUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateUserPasswordInput {
  id: string;
  hashedPassword: string;
  updatedAt: Date;
}

export interface UpdateUserProfileInput {
  id: string;
  username?: string;
  bio?: string | null;
  avatarUrl?: string | null;
  updatedAt: Date;
}

export interface TouchUserInput {
  id: string;
  updatedAt: Date;
}

export type UserWithProfile = User & {
  profile: UserProfile | null;
};

export interface UserRepository {
  insertUser(input: InsertUserInput): Promise<void>;
  insertUserProfile(input: InsertUserProfileInput): Promise<void>;
  touchUser(input: TouchUserInput): Promise<boolean>;
  findByEmail(email: string): Promise<UserWithProfile | undefined>;
  findById(id: string): Promise<UserWithProfile | undefined>;
  updatePassword(input: UpdateUserPasswordInput): Promise<boolean>;
  updateProfile(input: UpdateUserProfileInput): Promise<boolean>;
}
