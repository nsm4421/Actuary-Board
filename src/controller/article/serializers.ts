import type { ArticleListResult } from "@/service/article/article-service";
import type { ArticleModel } from "@/model/article/article";
import type {
  ArticleResponse,
  ArticleListResponse,
  ArticleCursorRequest,
} from "@/controller/article/dto";

export const toArticleResponse = (article: ArticleModel): ArticleResponse => ({
  ...article,
});

const toCursorResponse = (
  cursor: ArticleListResult["nextCursor"],
): ArticleCursorRequest | null =>
  cursor
    ? {
        createdAt: cursor.createdAt,
        id: cursor.id,
      }
    : null;

export const toArticleListResponse = (
  result: ArticleListResult,
): ArticleListResponse => ({
  articles: result.items.map(toArticleResponse),
  nextCursor: toCursorResponse(result.nextCursor),
});
