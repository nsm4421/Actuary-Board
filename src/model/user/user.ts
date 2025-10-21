import { BaseModel } from "../base-model";

export interface UserModel extends BaseModel {
  email: string;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
}
