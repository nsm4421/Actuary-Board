import "reflect-metadata";
import { container } from "tsyringe";
import type { UserService } from "@/service/user/user-service";
import { DefaultUserServiceImpl } from "@/service/user/user-service-impl";
import type { ArticleService } from "@/service/article/article-service";
import { DefaultArticleServiceImpl } from "@/service/article/article-service-impl";

export const UserServiceToken = Symbol("UserService");
export const ArticleServiceToken = Symbol("ArticleService");

container.register<UserService>(UserServiceToken, {
  useClass: DefaultUserServiceImpl,
});

container.register<ArticleService>(ArticleServiceToken, {
  useClass: DefaultArticleServiceImpl,
});

export const resolveUserService = () =>
  container.resolve<UserService>(UserServiceToken);

export const resolveArticleService = () =>
  container.resolve<ArticleService>(ArticleServiceToken);
