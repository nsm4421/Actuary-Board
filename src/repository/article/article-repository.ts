import type { Article } from "@/db/schema/articles";
import type { UserProfile } from "@/db/schema/user-profiles";
import type { ArticleCategory } from "@/core/constants/article";

export interface CreateArticleInput {
  authorId: string;
  title: string;
  content: string;
  category: ArticleCategory;
  isPublic?: boolean;
}

export interface UpdateArticleInput {
  id: string;
  title?: string;
  content?: string;
  category?: ArticleCategory;
  isPublic?: boolean;
}

export interface ArticleCursor {
  createdAt: Date | string | number;
  id: string;
}

export interface ArticlePaginationOptions {
  limit?: number;
  cursor?: ArticleCursor | null;
}

export interface AdjustArticleCountersInput {
  id: string;
  likeDelta?: number;
  commentDelta?: number;
}

export interface ArticleWithAuthor {
  article: Article;
  authorProfile: UserProfile | null;
}

export interface ArticleRepository {
  create(input: CreateArticleInput): Promise<Article>;
  findById(id: string): Promise<Article | undefined>;
  findDetailedById(id: string): Promise<ArticleWithAuthor | undefined>;
  findByAuthor(
    authorId: string,
    options?: ArticlePaginationOptions,
  ): Promise<ArticleWithAuthor[]>;
  listPublicByCategory(
    category: ArticleCategory,
    options?: ArticlePaginationOptions,
  ): Promise<ArticleWithAuthor[]>;
  update(input: UpdateArticleInput): Promise<Article | undefined>;
  adjustCounters(
    input: AdjustArticleCountersInput,
  ): Promise<Article | undefined>;
  delete(id: string): Promise<boolean>;
}
