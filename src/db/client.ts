import "reflect-metadata";
import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { drizzle } from "drizzle-orm/better-sqlite3";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { singleton } from "tsyringe";
import * as schema from "@/db/schema";

export type DatabaseClient = BetterSQLite3Database<typeof schema>;

const defaultPath = ".data/dev.sqlite";
const databasePath = process.env.SQLITE_DB_PATH ?? defaultPath;

const ensureDirectory = (filePath: string) => {
  const dir = dirname(filePath);
  if (dir && dir !== "." && dir !== "..") {
    mkdirSync(dir, { recursive: true });
  }
};

@singleton()
export class SqliteDatabaseClient {
  private readonly client: DatabaseClient;

  constructor() {
    ensureDirectory(databasePath);
    const sqlite = new Database(databasePath);
    this.client = drizzle(sqlite, { schema });
  }

  get connection(): DatabaseClient {
    return this.client;
  }
}
