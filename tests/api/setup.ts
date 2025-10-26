import "reflect-metadata";
import { container } from "tsyringe";
import { createTestDatabase } from "@tests/utils/test-database";
import { DatabaseClientToken } from "@/db/tokens";
import {
  UserRepositoryToken,
  ArticleRepositoryToken,
} from "@/repository/di";
import { UserServiceToken, ArticleServiceToken } from "@/service/di";
import {
  UserControllerToken,
  ArticleControllerToken,
} from "@/controller/di";
import { DrizzleUserRepository } from "@/repository/user/user-repository-impl";
import { DrizzleArticleRepository } from "@/repository/article/article-repository-impl";
import { DefaultUserServiceImpl } from "@/service/user/user-service-impl";
import { DefaultArticleServiceImpl } from "@/service/article/article-service-impl";
import { UserController } from "@/controller/user/user-controller";
import { ArticleController } from "@/controller/article/article-controller";

export const setupApiTest = () => {
  const { client, sqlite } = createTestDatabase();

  container.reset();
  container.registerInstance(DatabaseClientToken, client);
  container.register(UserRepositoryToken, {
    useClass: DrizzleUserRepository,
  });
  container.register(ArticleRepositoryToken, {
    useClass: DrizzleArticleRepository,
  });
  container.register(UserServiceToken, {
    useClass: DefaultUserServiceImpl,
  });
  container.register(ArticleServiceToken, {
    useClass: DefaultArticleServiceImpl,
  });
  container.register(UserControllerToken, {
    useClass: UserController,
  });
  container.register(ArticleControllerToken, {
    useClass: ArticleController,
  });

  return {
    sqlite,
    cleanup: () => {
      sqlite.close();
      container.reset();
    },
  };
};
