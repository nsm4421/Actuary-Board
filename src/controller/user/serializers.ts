import type { UserResponse } from "@/controller/user/dto";
import type { UserModel } from "@/model/user/user";

export const toUserResponse = (user: UserModel): UserResponse => ({ ...user });
