export const ARTICLE_CATEGORIES = {
  FREE: "free",
  CAREER: "career",
  EXAM: "exam",
  INDUSTRY: "industry",
} as const;

export const ARTICLE_CATEGORY_LABELS: Record<ArticleCategory, string> = {
  free: "자유게시판",
  career: "취업",
  exam: "자격증시험",
  industry: "업계이슈",
};

export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[keyof typeof ARTICLE_CATEGORIES];

export const ARTICLE_CATEGORY_OPTIONS = Object.entries(
  ARTICLE_CATEGORY_LABELS,
).map(([value, label]) => ({ value, label }));
