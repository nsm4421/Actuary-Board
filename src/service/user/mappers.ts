import type { User } from "@/db/schema/users";
import type { UserModel } from "@/model/user/user";

const formatTimestamp = (value: User["createdAt"]): string => {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return new Date(value).toISOString();
};

export const toUserModel = (user: User): UserModel => ({
  id: user.id,
  email: user.email,
  name: user.name ?? null,
  createdAt: formatTimestamp(user.createdAt),
  updatedAt: formatTimestamp(user.updatedAt),
});
