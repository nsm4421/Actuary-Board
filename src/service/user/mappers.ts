import type { UserWithProfile } from "@/repository/user/user-repository";
import type { UserModel } from "@/model/user/user";

const formatTimestamp = (value: UserWithProfile["createdAt"]): string => {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return new Date(value).toISOString();
};

export const toUserModel = (user: UserWithProfile): UserModel => {
  const profile = user.profile;
  if (!profile) {
    throw new Error("User profile not found");
  }

  return {
    id: user.id,
    email: user.email,
    username: profile.username,
    bio: profile.bio ?? null,
    avatarUrl: profile.avatarUrl ?? null,
    createdAt: formatTimestamp(user.createdAt),
    updatedAt: formatTimestamp(user.updatedAt),
  };
};
