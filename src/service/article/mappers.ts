import type { Article } from "@/db/schema/articles";
import type { UserProfile } from "@/db/schema/user-profiles";
import type { ArticleModel, ArticleAuthorModel } from "@/model/article/article";

const toTimestampString = (value: Article["createdAt"]): string => {
  if (value instanceof Date) {
    return value.toISOString();
  }
  return new Date(value).toISOString();
};

const toNumber = (value: unknown): number => {
  if (typeof value === "number") {
    return value;
  }
  if (value instanceof Date) {
    return value.getTime();
  }
  if (typeof value === "bigint") {
    return Number(value);
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

const toAuthorModel = (
  profile: UserProfile | null | undefined,
): ArticleAuthorModel | null => {
  if (!profile) {
    return null;
  }

  return {
    id: profile.userId,
    username: profile.username,
    bio: profile.bio ?? null,
    avatarUrl: profile.avatarUrl ?? null,
  };
};

export const toArticleModel = (
  article: Article,
  authorProfile: UserProfile | null | undefined,
): ArticleModel => ({
  id: article.id,
  authorId: article.authorId,
  title: article.title,
  content: article.content,
  category: article.category,
  isPublic: Boolean(article.isPublic),
  likeCount: toNumber(article.likeCount),
  commentCount: toNumber(article.commentCount),
  createdAt: toTimestampString(article.createdAt),
  updatedAt: toTimestampString(article.updatedAt),
  author: toAuthorModel(authorProfile),
});
