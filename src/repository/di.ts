import "reflect-metadata";
import { container } from "tsyringe";
import type { UserRepository } from "@/repository/user/user-repository";
import { DrizzleUserRepository } from "@/repository/user/user-repository-impl";

export const UserRepositoryToken = Symbol("UserRepository");

container.register<UserRepository>(UserRepositoryToken, {
  useClass: DrizzleUserRepository,
});

export const resolveUserRepository = () =>
  container.resolve<UserRepository>(UserRepositoryToken);
