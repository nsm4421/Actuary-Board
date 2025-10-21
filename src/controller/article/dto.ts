import type { ArticleCategory } from "@/core/constants/article";
import type { ArticleModel } from "@/model/article/article";

export interface CreateArticleRequest {
  authorId: string;
  title: string;
  content: string;
  category: ArticleCategory;
  isPublic?: boolean;
}

export interface UpdateArticleRequest {
  articleId: string;
  title?: string;
  content?: string;
  category?: ArticleCategory;
  isPublic?: boolean;
}

export interface AdjustArticleCountersRequest {
  articleId: string;
  likeDelta?: number;
  commentDelta?: number;
}

export interface DeleteArticleRequest {
  articleId: string;
}

export interface ArticleCursorRequest {
  createdAt: string;
  id: string;
}

export interface ListArticlesByAuthorRequest {
  authorId: string;
  limit?: number;
  cursor?: ArticleCursorRequest | null;
}

export interface ListArticlesByCategoryRequest {
  category: ArticleCategory;
  limit?: number;
  cursor?: ArticleCursorRequest | null;
}

export type ArticleResponse = ArticleModel;

export interface ArticleListResponse {
  articles: ArticleResponse[];
  nextCursor: ArticleCursorRequest | null;
}
