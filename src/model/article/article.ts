import type { ArticleCategory } from "@/core/constants/article";
import type { BaseModel } from "@/model/base-model";
import type { UserProfileModel } from "@/model/user/user-profile";

export interface ArticleModel extends BaseModel {
  title: string;
  content: string;
  category: ArticleCategory;
  isPublic: boolean;
  likeCount: number;
  commentCount: number;
  author: UserProfileModel | null;
}
