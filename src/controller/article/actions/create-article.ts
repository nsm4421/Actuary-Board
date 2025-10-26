import { resolveArticleController } from "@/controller/di";
import {
  createArticleRequestSchema,
  type CreateArticleRequest,
} from "@/core/validators/article";

export function validateCreateArticleRequest(input: unknown) {
  return createArticleRequestSchema.safeParse(input);
}

export async function createArticleAction(
  authorId: string,
  data: CreateArticleRequest,
) {
  const controller = resolveArticleController();
  return controller.create({
    authorId,
    title: data.title,
    content: data.content,
    category: data.category,
    isPublic: data.isPublic,
  });
}
