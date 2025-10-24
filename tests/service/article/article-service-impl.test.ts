import "reflect-metadata";
import { describe, it, expect, beforeEach } from "vitest";
import { DefaultArticleServiceImpl } from "@/service/article/article-service-impl";
import type {
  AdjustArticleCountersInput,
  ArticleRepository,
  ArticleWithAuthor,
  ArticlePaginationOptions,
  CreateArticleInput,
  UpdateArticleInput,
} from "@/repository/article/article-repository";
import type { Article } from "@/db/schema/articles";
import type { UserProfile } from "@/db/schema/user-profiles";
import type { ArticleCategory } from "@/core/constants/article";

const makeArticle = (overrides: Partial<Article> = {}): Article => {
  const now = new Date();
  return {
    id: "article-id",
    authorId: "author-1",
    title: "Sample",
    content: "Body",
    category: "free" as ArticleCategory,
    isPublic: true,
    likeCount: 0,
    commentCount: 0,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
};

const makeProfile = (overrides: Partial<UserProfile> = {}): UserProfile => {
  const now = new Date();
  return {
    userId: "author-1",
    username: "author",
    bio: "bio",
    avatarUrl: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
};

class MockArticleRepository implements ArticleRepository {
  adjustCalls: AdjustArticleCountersInput[] = [];
  findDetailedCalls: string[] = [];
  adjustResponder: (input: AdjustArticleCountersInput) =>
    | Article
    | undefined
    | Promise<Article | undefined> = () => undefined;
  findDetailedResponder: (id: string) =>
    | ArticleWithAuthor
    | undefined
    | Promise<ArticleWithAuthor | undefined> = () => undefined;

  async create(_input: CreateArticleInput): Promise<Article> {
    throw new Error("Not implemented");
  }

  async findById(_id: string): Promise<Article | undefined> {
    throw new Error("Not implemented");
  }

  async findDetailedById(id: string): Promise<ArticleWithAuthor | undefined> {
    this.findDetailedCalls.push(id);
    return this.findDetailedResponder(id);
  }

  async findByAuthor(
    _authorId: string,
    _options?: ArticlePaginationOptions,
  ): Promise<ArticleWithAuthor[]> {
    throw new Error("Not implemented");
  }

  async listPublicByCategory(
    _category: ArticleCategory,
    _options?: ArticlePaginationOptions,
  ): Promise<ArticleWithAuthor[]> {
    throw new Error("Not implemented");
  }

  async update(_input: UpdateArticleInput): Promise<Article | undefined> {
    throw new Error("Not implemented");
  }

  async adjustCounters(input: AdjustArticleCountersInput): Promise<Article | undefined> {
    this.adjustCalls.push(input);
    return this.adjustResponder(input);
  }

  async delete(_id: string): Promise<boolean> {
    throw new Error("Not implemented");
  }
}

describe("DefaultArticleServiceImpl.adjustCounters", () => {
  let repository: MockArticleRepository;
  let service: DefaultArticleServiceImpl;

  beforeEach(() => {
    repository = new MockArticleRepository();
    service = new DefaultArticleServiceImpl(repository);
  });

  it("returns updated article when repository succeeds", async () => {
    const baseArticle = makeArticle({ likeCount: 5, commentCount: 1 });
    const updatedArticle = { ...baseArticle, likeCount: 7, commentCount: 4 };
    const profile = makeProfile();

    repository.adjustResponder = async (input) => {
      expect(input).toEqual({
        id: baseArticle.id,
        likeDelta: 2,
        commentDelta: 3,
      });
      return updatedArticle;
    };

    repository.findDetailedResponder = async (id) => {
      expect(id).toBe(baseArticle.id);
      return { article: updatedArticle, authorProfile: profile };
    };

    const result = await service.adjustCounters({
      articleId: baseArticle.id,
      likeDelta: 2,
      commentDelta: 3,
    });

    expect(result).toEqual({
      id: updatedArticle.id,
      title: updatedArticle.title,
      content: updatedArticle.content,
      category: updatedArticle.category,
      isPublic: updatedArticle.isPublic,
      likeCount: 7,
      commentCount: 4,
      createdAt: updatedArticle.createdAt.toISOString(),
      updatedAt: updatedArticle.updatedAt.toISOString(),
      author: {
        id: profile.userId,
        username: profile.username,
        bio: profile.bio,
        avatarUrl: profile.avatarUrl,
      },
    });
  });

  it("returns undefined when repository adjustCounters yields nothing", async () => {
    repository.adjustResponder = async () => undefined;

    const result = await service.adjustCounters({
      articleId: "missing",
      likeDelta: 1,
      commentDelta: 1,
    });

    expect(result).toBeUndefined();
    expect(repository.findDetailedCalls).toHaveLength(0);
  });

  it("returns undefined when detailed lookup fails", async () => {
    const article = makeArticle();
    repository.adjustResponder = async () => article;
    repository.findDetailedResponder = async () => undefined;

    const result = await service.adjustCounters({
      articleId: article.id,
      likeDelta: 1,
    });

    expect(result).toBeUndefined();
  });
});
