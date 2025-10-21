import "reflect-metadata";
import { container } from "tsyringe";
import { createTestDatabase } from "@tests/utils/test-database";
import { DatabaseClientToken } from "@/db/di";
import { UserRepositoryToken } from "@/repository/di";
import { UserServiceToken } from "@/service/di";
import { UserControllerToken } from "@/controller/di";
import { DrizzleUserRepository } from "@/repository/user/user-repository-impl";
import { DefaultUserServiceImpl } from "@/service/user/user-service-impl";
import { UserController } from "@/controller/user/user-controller";

export const setupApiTest = () => {
  const { client, sqlite } = createTestDatabase();

  container.reset();
  container.registerInstance(DatabaseClientToken, client);
  container.register(UserRepositoryToken, {
    useClass: DrizzleUserRepository,
  });
  container.register(UserServiceToken, {
    useClass: DefaultUserServiceImpl,
  });
  container.register(UserControllerToken, {
    useClass: UserController,
  });

  return {
    sqlite,
    cleanup: () => {
      sqlite.close();
      container.reset();
    },
  };
};
