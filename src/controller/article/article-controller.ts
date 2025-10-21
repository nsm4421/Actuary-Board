import "reflect-metadata";
import { inject, singleton } from "tsyringe";
import type { ArticleService } from "@/service/article/article-service";
import { ArticleServiceToken } from "@/service/di";
import type {
  CreateArticleRequest,
  UpdateArticleRequest,
  AdjustArticleCountersRequest,
  ListArticlesByAuthorRequest,
  ListArticlesByCategoryRequest,
  DeleteArticleRequest,
  ArticleListResponse,
  ArticleResponse,
} from "@/controller/article/dto";
import {
  toArticleListResponse,
  toArticleResponse,
} from "@/controller/article/serializers";

@singleton()
export class ArticleController {
  constructor(
    @inject(ArticleServiceToken)
    private readonly articleService: ArticleService,
  ) {}

  async create(request: CreateArticleRequest): Promise<ArticleResponse> {
    const article = await this.articleService.create({
      authorId: request.authorId,
      title: request.title,
      content: request.content,
      category: request.category,
      isPublic: request.isPublic,
    });
    return toArticleResponse(article);
  }

  async getById(id: string): Promise<ArticleResponse | undefined> {
    const article = await this.articleService.getById(id);
    return article ? toArticleResponse(article) : undefined;
  }

  async listByAuthor(
    request: ListArticlesByAuthorRequest,
  ): Promise<ArticleListResponse> {
    const result = await this.articleService.listByAuthor(request.authorId, {
      limit: request.limit,
      cursor: request.cursor ?? null,
    });
    return toArticleListResponse(result);
  }

  async listPublicByCategory(
    request: ListArticlesByCategoryRequest,
  ): Promise<ArticleListResponse> {
    const result = await this.articleService.listPublicByCategory(
      request.category,
      {
        limit: request.limit,
        cursor: request.cursor ?? null,
      },
    );
    return toArticleListResponse(result);
  }

  async update(
    request: UpdateArticleRequest,
  ): Promise<ArticleResponse | undefined> {
    const updated = await this.articleService.update({
      articleId: request.articleId,
      title: request.title,
      content: request.content,
      category: request.category,
      isPublic: request.isPublic,
    });
    return updated ? toArticleResponse(updated) : undefined;
  }

  async adjustCounters(
    request: AdjustArticleCountersRequest,
  ): Promise<ArticleResponse | undefined> {
    const updated = await this.articleService.adjustCounters({
      articleId: request.articleId,
      likeDelta: request.likeDelta,
      commentDelta: request.commentDelta,
    });
    return updated ? toArticleResponse(updated) : undefined;
  }

  async delete(request: DeleteArticleRequest): Promise<boolean> {
    return this.articleService.delete(request.articleId);
  }
}
