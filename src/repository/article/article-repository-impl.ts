import {
  type ArticleRepository,
  type CreateArticleInput,
  type UpdateArticleInput,
  type AdjustArticleCountersInput,
  type ArticlePaginationOptions,
  type ArticleWithAuthor,
  type ArticleCursor,
} from "./article-repository";
import "reflect-metadata";
import { and, desc, eq, lt, or } from "drizzle-orm";
import { inject, singleton } from "tsyringe";
import { sql } from "drizzle-orm";
import type { DatabaseClient } from "@/db/client";
import { articles } from "@/db/schema/articles";
import { userProfiles } from "@/db/schema/user-profiles";
import { DatabaseClientToken } from "@/db/di";
import type { ArticleCategory } from "@/core/constants/article";
import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from "@/core/constants/pagination";

@singleton()
export class DrizzleArticleRepository implements ArticleRepository {
  constructor(
    @inject(DatabaseClientToken)
    private readonly client: DatabaseClient,
  ) {}

  async create(input: CreateArticleInput) {
    const now = new Date();
    const [created] = await this.client
      .insert(articles)
      .values({
        authorId: input.authorId,
        title: input.title.trim(),
        content: input.content.trim(),
        category: input.category,
        isPublic: input.isPublic ?? true,
        likeCount: 0,
        commentCount: 0,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    if (!created) {
      throw new Error("Failed to create article");
    }

    return created;
  }

  async findById(id: string) {
    return this.client.query.articles.findFirst({
      where: (article, { eq: equals }) => equals(article.id, id),
    });
  }

  async findDetailedById(id: string): Promise<ArticleWithAuthor | undefined> {
    const row = await this.client
      .select({
        article: articles,
        authorProfile: userProfiles,
      })
      .from(articles)
      .leftJoin(userProfiles, eq(userProfiles.userId, articles.authorId))
      .where(eq(articles.id, id))
      .limit(1)
      .then((rows) => rows[0]);

    if (!row) {
      return undefined;
    }

    return {
      article: row.article,
      authorProfile: row.authorProfile,
    };
  }

  async findByAuthor(
    authorId: string,
    options?: ArticlePaginationOptions,
  ): Promise<ArticleWithAuthor[]> {
    const { limit, cursor } = this.resolvePaginationOptions(options);
    const rows = await this.client
      .select({
        article: articles,
        authorProfile: userProfiles,
      })
      .from(articles)
      .leftJoin(userProfiles, eq(userProfiles.userId, articles.authorId))
      .where(
        this.buildCursorCondition([eq(articles.authorId, authorId)], cursor),
      )
      .orderBy(desc(articles.createdAt), desc(articles.id))
      .limit(limit);

    return rows.map(({ article, authorProfile }) => ({
      article,
      authorProfile,
    }));
  }

  async listPublicByCategory(
    category: ArticleCategory,
    options?: ArticlePaginationOptions,
  ): Promise<ArticleWithAuthor[]> {
    const { limit, cursor } = this.resolvePaginationOptions(options);
    const rows = await this.client
      .select({
        article: articles,
        authorProfile: userProfiles,
      })
      .from(articles)
      .leftJoin(userProfiles, eq(userProfiles.userId, articles.authorId))
      .where(
        this.buildCursorCondition(
          [eq(articles.category, category), eq(articles.isPublic, true)],
          cursor,
        ),
      )
      .orderBy(desc(articles.createdAt), desc(articles.id))
      .limit(limit);

    return rows.map(({ article, authorProfile }) => ({
      article,
      authorProfile,
    }));
  }

  async update(input: UpdateArticleInput) {
    const updates: Partial<typeof articles.$inferInsert> = {};
    if (input.title !== undefined) {
      updates.title = input.title.trim();
    }
    if (input.content !== undefined) {
      updates.content = input.content.trim();
    }
    if (input.category !== undefined) {
      updates.category = input.category;
    }
    if (input.isPublic !== undefined) {
      updates.isPublic = input.isPublic;
    }

    if (Object.keys(updates).length === 0) {
      return this.findById(input.id);
    }

    updates.updatedAt = new Date();

    const [updated] = await this.client
      .update(articles)
      .set(updates)
      .where(eq(articles.id, input.id))
      .returning();

    return updated;
  }

  async adjustCounters(input: AdjustArticleCountersInput) {
    if (
      input.likeDelta === undefined &&
      input.commentDelta === undefined
    ) {
      return this.findById(input.id);
    }

    const setValues: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (typeof input.likeDelta === "number" && input.likeDelta !== 0) {
      setValues.likeCount = sql`${articles.likeCount} + ${input.likeDelta}`;
    }

    if (typeof input.commentDelta === "number" && input.commentDelta !== 0) {
      setValues.commentCount = sql`${articles.commentCount} + ${input.commentDelta}`;
    }

    const [updated] = await this.client
      .update(articles)
      .set(setValues)
      .where(eq(articles.id, input.id))
      .returning();

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.client
      .delete(articles)
      .where(eq(articles.id, id))
      .run();
    return result.changes > 0;
  }

  private resolvePaginationOptions(
    options?: ArticlePaginationOptions,
  ): {
    limit: number;
    cursor?: { createdAt: Date; id: string };
  } {
    const limit = Math.min(
      Math.max(options?.limit ?? DEFAULT_PAGE_SIZE, 1),
      MAX_PAGE_SIZE,
    );
    const cursor = this.normalizeCursor(options?.cursor ?? null);
    return { limit, cursor };
  }

  private normalizeCursor(
    cursor: ArticleCursor | null | undefined,
  ): { createdAt: Date; id: string } | undefined {
    if (!cursor) {
      return undefined;
    }

    const createdAt =
      cursor.createdAt instanceof Date
        ? cursor.createdAt
        : new Date(cursor.createdAt);
    if (Number.isNaN(createdAt.getTime())) {
      throw new Error("Invalid article cursor: createdAt");
    }

    const id = cursor.id?.trim();
    if (!id) {
      throw new Error("Invalid article cursor: id");
    }

    return { createdAt, id };
  }

  private buildCursorCondition(
    baseConditions: Array<ReturnType<typeof eq>>,
    cursor?: { createdAt: Date; id: string },
  ) {
    let condition =
      baseConditions.length > 0 ? baseConditions[0] : undefined;
    for (let i = 1; i < baseConditions.length; i += 1) {
      condition = condition
        ? and(condition, baseConditions[i]!)
        : baseConditions[i]!;
    }

    if (cursor) {
      const cursorCondition = or(
        lt(articles.createdAt, cursor.createdAt),
        and(
          eq(articles.createdAt, cursor.createdAt),
          lt(articles.id, cursor.id),
        ),
      );
      condition = condition ? and(condition, cursorCondition) : cursorCondition;
    }

    return condition;
  }
}
