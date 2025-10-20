export interface RegisterUserRequest {
  email: string;
  password: string;
  name?: string | null;
}

export interface UpdatePasswordRequest {
  userId: string;
  password: string;
}

export interface UpdateProfileRequest {
  userId: string;
  name: string | null;
}
