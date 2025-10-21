import "reflect-metadata";
import { inject, singleton } from "tsyringe";
import {
  type AdjustArticleCountersInput,
  type ArticleCursor,
  type ArticleListOptions,
  type ArticleListResult,
  type ArticleService,
  type CreateArticleInput,
  type UpdateArticleInput,
} from "@/service/article/article-service";
import {
  ArticleRepositoryToken,
  type ArticleRepository,
} from "@/repository/di";
import {
  type ArticlePaginationOptions,
  type ArticleWithAuthor,
} from "@/repository/article/article-repository";
import { toArticleModel } from "@/service/article/mappers";
import type { ArticleModel } from "@/model/article/article";
import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from "@/core/constants/pagination";

@singleton()
export class DefaultArticleServiceImpl implements ArticleService {
  constructor(
    @inject(ArticleRepositoryToken)
    private readonly repository: ArticleRepository,
  ) {}

  async create(input: CreateArticleInput): Promise<ArticleModel> {
    const created = await this.repository.create({
      authorId: input.authorId,
      title: input.title,
      content: input.content,
      category: input.category,
      isPublic: input.isPublic,
    });

    const detailed = await this.repository.findDetailedById(created.id);
    if (!detailed) {
      throw new Error("Failed to load created article");
    }

    return toArticleModel(detailed.article, detailed.authorProfile);
  }

  async getById(id: string): Promise<ArticleModel | undefined> {
    const result = await this.repository.findDetailedById(id);
    return result
      ? toArticleModel(result.article, result.authorProfile)
      : undefined;
  }

  async listByAuthor(
    authorId: string,
    options?: ArticleListOptions,
  ): Promise<ArticleListResult> {
    const req = this.toRepositoryPaginationOptions(options);
    const rows = await this.repository.findByAuthor(authorId, req);
    return this.toListResult(rows, req.limit);
  }

  async listPublicByCategory(
    category: CreateArticleInput["category"],
    options?: ArticleListOptions,
  ): Promise<ArticleListResult> {
    const req = this.toRepositoryPaginationOptions(options);
    const rows = await this.repository.listPublicByCategory(category, req);
    return this.toListResult(rows, req.limit);
  }

  async update(
    input: UpdateArticleInput,
  ): Promise<ArticleModel | undefined> {
    const updated = await this.repository.update({
      id: input.articleId,
      title: input.title,
      content: input.content,
      category: input.category,
      isPublic: input.isPublic,
    });

    if (!updated) {
      return undefined;
    }

    const detailed = await this.repository.findDetailedById(updated.id);
    return detailed
      ? toArticleModel(detailed.article, detailed.authorProfile)
      : undefined;
  }

  async adjustCounters(
    input: AdjustArticleCountersInput,
  ): Promise<ArticleModel | undefined> {
    const updated = await this.repository.adjustCounters({
      id: input.articleId,
      likeDelta: input.likeDelta,
      commentDelta: input.commentDelta,
    });

    if (!updated) {
      return undefined;
    }

    const detailed = await this.repository.findDetailedById(updated.id);
    return detailed
      ? toArticleModel(detailed.article, detailed.authorProfile)
      : undefined;
  }

  async delete(articleId: string): Promise<boolean> {
    return this.repository.delete(articleId);
  }

  private toRepositoryPaginationOptions(
    options?: ArticleListOptions,
  ): ArticlePaginationOptions {
    const limit = Math.min(
      Math.max(options?.limit ?? DEFAULT_PAGE_SIZE, 1),
      MAX_PAGE_SIZE,
    );

    const cursor = options?.cursor
      ? {
          createdAt: options.cursor.createdAt,
          id: options.cursor.id,
        }
      : undefined;

    return { limit, cursor };
  }

  private toListResult(
    rows: ArticleWithAuthor[],
    limit: number,
  ): ArticleListResult {
    const items = rows.map(({ article, authorProfile }) =>
      toArticleModel(article, authorProfile),
    );

    const nextCursor =
      items.length === limit
        ? this.buildCursor(items[items.length - 1]!)
        : null;

    return { items, nextCursor };
  }

  private buildCursor(article: ArticleModel): ArticleCursor {
    return {
      createdAt: article.createdAt,
      id: article.id,
    };
  }
}
