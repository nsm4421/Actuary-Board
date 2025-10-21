import type { UserModel } from "@/model/user/user";

export interface RegisterUserRequest {
  email: string;
  password: string;
  username: string;
  bio?: string | null;
  avatarUrl?: string | null;
}

export interface UpdatePasswordRequest {
  userId: string;
  password: string;
}

export interface UpdateProfileRequest {
  userId: string;
  username?: string;
  bio?: string | null;
  avatarUrl?: string | null;
}

export interface LoginUserRequest {
  email: string;
  password: string;
}

export type UserResponse = UserModel;

export interface UserEnvelope {
  user: UserResponse;
}

export type RegisterUserResponse = UserEnvelope;
export type LoginUserResponse = UserEnvelope;
