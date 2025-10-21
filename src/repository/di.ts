import "reflect-metadata";
import { container } from "tsyringe";
import type { UserRepository } from "@/repository/user/user-repository";
import { DrizzleUserRepository } from "@/repository/user/user-repository-impl";
import type { ArticleRepository } from "@/repository/article/article-repository";
import { DrizzleArticleRepository } from "@/repository/article/article-repository-impl";

export const UserRepositoryToken = Symbol("UserRepository");
export const ArticleRepositoryToken = Symbol("ArticleRepository");

container.register<UserRepository>(UserRepositoryToken, {
  useClass: DrizzleUserRepository,
});

container.register<ArticleRepository>(ArticleRepositoryToken, {
  useClass: DrizzleArticleRepository,
});

export const resolveUserRepository = () =>
  container.resolve<UserRepository>(UserRepositoryToken);

export const resolveArticleRepository = () =>
  container.resolve<ArticleRepository>(ArticleRepositoryToken);

export type { ArticleRepository };
