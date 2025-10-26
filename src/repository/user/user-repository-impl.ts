import "reflect-metadata";
import { eq } from "drizzle-orm";
import { inject, singleton } from "tsyringe";
import type { DatabaseClient } from "@/db/client";
import { DatabaseClientToken } from "@/db/tokens";
import {
  type InsertUserInput,
  type InsertUserProfileInput,
  type TouchUserInput,
  type UpdateUserPasswordInput,
  type UpdateUserProfileInput,
  type UserRepository,
  type UserWithProfile,
} from "@/repository/user/user-repository";
import { users } from "@/db/schema/users";
import {
  userProfiles,
  type NewUserProfile,
} from "@/db/schema/user-profiles";
import { InvalidPasswordHashError } from "@/core/errors/password";

@singleton()
export class DrizzleUserRepository implements UserRepository {
  constructor(
    @inject(DatabaseClientToken)
    private readonly client: DatabaseClient,
  ) {}

  async insertUser(input: InsertUserInput): Promise<void> {
    this.assertHashedPassword(input.hashedPassword);
    this.client
      .insert(users)
      .values({
        id: input.id,
        email: input.email.toLowerCase(),
        hashedPassword: input.hashedPassword,
        createdAt: input.createdAt,
        updatedAt: input.updatedAt,
      })
      .run();
  }

  async insertUserProfile(input: InsertUserProfileInput): Promise<void> {
    const record: NewUserProfile = {
      userId: input.userId,
      username: this.normalizeUsername(input.username),
      bio: this.normalizeNullableText(input.bio, 30),
      avatarUrl: this.normalizeNullableText(input.avatarUrl),
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
    };

    this.client.insert(userProfiles).values(record).run();
  }

  async touchUser({ id, updatedAt }: TouchUserInput): Promise<boolean> {
    const result = this.client
      .update(users)
      .set({ updatedAt })
      .where(eq(users.id, id))
      .run();
    return Boolean(result.changes);
  }

  async findByEmail(email: string): Promise<UserWithProfile | undefined> {
    const normalized = email.toLowerCase();
    return this.client.query.users.findFirst({
      where: (table, { eq: equals }) => equals(table.email, normalized),
      with: { profile: true },
    });
  }

  async findById(id: string): Promise<UserWithProfile | undefined> {
    return this.client.query.users.findFirst({
      where: (table, { eq: equals }) => equals(table.id, id),
      with: { profile: true },
    });
  }

  async updatePassword({
    id,
    hashedPassword,
    updatedAt,
  }: UpdateUserPasswordInput): Promise<boolean> {
    this.assertHashedPassword(hashedPassword);
    const result = this.client
      .update(users)
      .set({ hashedPassword, updatedAt })
      .where(eq(users.id, id))
      .run();
    return Boolean(result.changes);
  }

  async updateProfile({
    id,
    username,
    bio,
    avatarUrl,
    updatedAt,
  }: UpdateUserProfileInput): Promise<boolean> {
    const updates: Partial<NewUserProfile> = {};

    if (username !== undefined) {
      updates.username = this.normalizeUsername(username);
    }

    if (bio !== undefined) {
      updates.bio = this.normalizeNullableText(bio, 30);
    }

    if (avatarUrl !== undefined) {
      updates.avatarUrl = this.normalizeNullableText(avatarUrl);
    }

    if (Object.keys(updates).length === 0) {
      return true;
    }

    updates.updatedAt = updatedAt;

    const result = this.client
      .update(userProfiles)
      .set(updates)
      .where(eq(userProfiles.userId, id))
      .run();

    return Boolean(result.changes);
  }

  private assertHashedPassword(hash: string): void {
    const sha256Regex = /^[a-f0-9]{64}$/i;
    if (!sha256Regex.test(hash)) {
      throw new InvalidPasswordHashError();
    }
  }

  private normalizeUsername(username: string): string {
    const trimmed = username.trim();
    if (!trimmed) {
      throw new Error("Username is required");
    }
    return trimmed;
  }

  private normalizeNullableText(
    value: string | null | undefined,
    maxLength?: number,
  ): string | null {
    if (value === undefined || value === null) {
      return null;
    }
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }
    if (maxLength !== undefined && trimmed.length > maxLength) {
      throw new Error(`Value must be at most ${maxLength} characters long`);
    }
    return trimmed;
  }
}
