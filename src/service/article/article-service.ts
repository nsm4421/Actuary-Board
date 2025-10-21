import type { ArticleCategory } from "@/core/constants/article";
import type { ArticleModel } from "@/model/article/article";

export interface CreateArticleInput {
  authorId: string;
  title: string;
  content: string;
  category: ArticleCategory;
  isPublic?: boolean;
}

export interface UpdateArticleInput {
  articleId: string;
  title?: string;
  content?: string;
  category?: ArticleCategory;
  isPublic?: boolean;
}

export interface AdjustArticleCountersInput {
  articleId: string;
  likeDelta?: number;
  commentDelta?: number;
}

export interface ArticleCursor {
  createdAt: string;
  id: string;
}

export interface ArticleListOptions {
  limit?: number;
  cursor?: ArticleCursor | null;
}

export interface ArticleListResult {
  items: ArticleModel[];
  nextCursor: ArticleCursor | null;
}

export interface ArticleService {
  create(input: CreateArticleInput): Promise<ArticleModel>;
  getById(id: string): Promise<ArticleModel | undefined>;
  listByAuthor(
    authorId: string,
    options?: ArticleListOptions,
  ): Promise<ArticleListResult>;
  listPublicByCategory(
    category: ArticleCategory,
    options?: ArticleListOptions,
  ): Promise<ArticleListResult>;
  update(input: UpdateArticleInput): Promise<ArticleModel | undefined>;
  adjustCounters(
    input: AdjustArticleCountersInput,
  ): Promise<ArticleModel | undefined>;
  delete(articleId: string): Promise<boolean>;
}
