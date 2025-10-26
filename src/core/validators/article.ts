import { z } from "zod";
import {
  ARTICLE_CATEGORIES,
  type ArticleCategory,
} from "@/core/constants/article";

const articleCategoryValues = Object.values(ARTICLE_CATEGORIES) as [
  ArticleCategory,
  ...ArticleCategory[],
];

export const createArticleRequestSchema = z.object({
  title: z
    .string({ required_error: "제목을 입력해주세요." })
    .trim()
    .min(1, "제목을 입력해주세요.")
    .max(120, "제목은 120자 이하로 입력해주세요."),
  category: z.enum(articleCategoryValues, {
    required_error: "카테고리를 선택해주세요.",
  }),
  content: z
    .string({ required_error: "내용을 입력해주세요." })
    .trim()
    .min(1, "내용을 입력해주세요.")
    .max(5000, "내용은 5000자 이하로 입력해주세요."),
  isPublic: z.boolean().default(true),
});

export type CreateArticleRequest = z.infer<typeof createArticleRequestSchema>;
