import "reflect-metadata";
import { container } from "tsyringe";
import { UserController } from "@/controller/user/user-controller";
import { ArticleController } from "@/controller/article/article-controller";

export const UserControllerToken = Symbol("UserController");
export const ArticleControllerToken = Symbol("ArticleController");

container.register<UserController>(UserControllerToken, {
  useClass: UserController,
});

container.register<ArticleController>(ArticleControllerToken, {
  useClass: ArticleController,
});

export const resolveUserController = () =>
  container.resolve<UserController>(UserControllerToken);

export const resolveArticleController = () =>
  container.resolve<ArticleController>(ArticleControllerToken);
