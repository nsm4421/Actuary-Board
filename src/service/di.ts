import "reflect-metadata";
import { container } from "tsyringe";
import type { UserService } from "@/service/user/user-service";
import { DefaultUserServiceImpl } from "@/service/user/user-service-impl";

export const UserServiceToken = Symbol("UserService");

container.register<UserService>(UserServiceToken, {
  useClass: DefaultUserServiceImpl,
});

export const resolveUserService = () =>
  container.resolve<UserService>(UserServiceToken);
