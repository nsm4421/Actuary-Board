import "reflect-metadata";
import { container } from "tsyringe";
import { UserController } from "@/controller/user/user-controller";

export const UserControllerToken = Symbol("UserController");

container.register<UserController>(UserControllerToken, {
  useClass: UserController,
});

export const resolveUserController = () =>
  container.resolve<UserController>(UserControllerToken);
