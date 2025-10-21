import Database from "better-sqlite3";
import type { Database as DatabaseInstance } from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "@/db/schema";

export type TestDatabaseClient = BetterSQLite3Database<typeof schema>;

const createSchema = (db: DatabaseInstance) => {
  db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      hashed_password TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users(email);

    CREATE TABLE IF NOT EXISTS user_profiles (
      user_id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      bio TEXT,
      avatar_url TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE UNIQUE INDEX IF NOT EXISTS user_profiles_username_unique ON user_profiles(username);
  `);
};

export const createTestDatabase = () => {
  const sqlite = new Database(":memory:");
  createSchema(sqlite);
  const client = drizzle(sqlite, { schema });
  return {
    client,
    sqlite,
  };
};
