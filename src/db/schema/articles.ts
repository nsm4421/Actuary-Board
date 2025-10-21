import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";
import {
  integer,
  sqliteTable,
  text,
  index,
} from "drizzle-orm/sqlite-core";
import { users } from "./users";
import type { ArticleCategory } from "@/core/constants/article";

export const articles = sqliteTable(
  "articles",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    authorId: text("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    category: text("category")
      .notNull()
      .$type<ArticleCategory>().default("free"),
    content: text("content").notNull(),
    isPublic: integer("is_public", { mode: "boolean" })
      .notNull()
      .default(true),
    likeCount: integer("like_count").default(0).notNull(),
    commentCount: integer("comment_count").default(0).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch('now') * 1000)`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .default(sql`(unixepoch('now') * 1000)`)
      .notNull(),
  },
  (table) => ({
    authorIdx: index("articles_author_idx").on(table.authorId),
    categoryIdx: index("articles_category_idx").on(table.category),
  }),
);

export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;
