import "reflect-metadata";
import { container } from "tsyringe";
import type { DatabaseClient } from "@/db/client";
import { SqliteDatabaseClient } from "@/db/client";
import { TransactionManager } from "@/db/transaction-manager";

export const DatabaseClientToken = Symbol("DatabaseClient");

container.register<DatabaseClient>(DatabaseClientToken, {
  useFactory: (dependencyContainer) =>
    dependencyContainer.resolve(SqliteDatabaseClient).connection,
});

container.register(TransactionManager, {
  useClass: TransactionManager,
});

export const resolveDatabaseClient = () =>
  container.resolve<DatabaseClient>(DatabaseClientToken);
