import "reflect-metadata";
import Database from "better-sqlite3";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { drizzle } from "drizzle-orm/better-sqlite3";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
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

type ColumnInfoRow = { name: string };

const tableExists = (sqlite: Database.Database, table: string) => {
  return Boolean(
    sqlite
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name = ? LIMIT 1",
      )
      .get(table),
  );
};

const ensureArticleLegacyColumns = (sqlite: Database.Database) => {
  if (!tableExists(sqlite, "articles")) {
    return;
  }

  const columns = sqlite
    .prepare("PRAGMA table_info(articles)")
    .all() as ColumnInfoRow[];
  const hasColumn = (name: string) =>
    columns.some((column) => column.name === name);

  const statements: string[] = [];
  if (!hasColumn("is_public")) {
    statements.push(
      "ALTER TABLE articles ADD COLUMN is_public INTEGER NOT NULL DEFAULT 1",
    );
  }
  if (!hasColumn("like_count")) {
    statements.push(
      "ALTER TABLE articles ADD COLUMN like_count INTEGER NOT NULL DEFAULT 0",
    );
  }
  if (!hasColumn("comment_count")) {
    statements.push(
      "ALTER TABLE articles ADD COLUMN comment_count INTEGER NOT NULL DEFAULT 0",
    );
  }

  statements.forEach((statement) => sqlite.exec(statement));
};

@singleton()
export class SqliteDatabaseClient {
  private readonly client: DatabaseClient;

  constructor() {
    ensureDirectory(databasePath);
    const sqlite = new Database(databasePath);
    ensureArticleLegacyColumns(sqlite);

    const drizzleClient = drizzle(sqlite, { schema });

    const shouldMigrate =
      (process.env.NODE_ENV ?? "development") !== "production" &&
      process.env.DB_AUTO_MIGRATE !== "false";

    if (shouldMigrate) {
      const migrationsFolder = resolve(process.cwd(), "drizzle");
      const journalFile = resolve(migrationsFolder, "meta/_journal.json");
      if (existsSync(journalFile)) {
        migrate(drizzleClient, { migrationsFolder });
      }
    }

    this.client = drizzleClient;
  }

  get connection(): DatabaseClient {
    return this.client;
  }
}
