import "reflect-metadata";
import { container } from "tsyringe";
import type { DatabaseClient } from "@/db/client";
import { SqliteDatabaseClient } from "@/db/client";

export const DatabaseClientToken = Symbol("DatabaseClient");

container.register<DatabaseClient>(DatabaseClientToken, {
  useFactory: (dependencyContainer) =>
    dependencyContainer.resolve(SqliteDatabaseClient).connection,
});

export const resolveDatabaseClient = () =>
  container.resolve<DatabaseClient>(DatabaseClientToken);
