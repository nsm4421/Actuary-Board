import {
  type CreateUserInput,
  type UpdateUserPasswordInput,
  type UpdateUserProfileInput,
  type UserRepository,
  type UserWithProfile,
} from "./user-repository";
import "reflect-metadata";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { inject, singleton } from "tsyringe";
import type { DatabaseClient } from "@/db/client";
import { users, type NewUser } from "@/db/schema/users";
import {
  userProfiles,
  type NewUserProfile,
} from "@/db/schema/user-profiles";
import { DatabaseClientToken } from "@/db/di";
import { InvalidPasswordHashError } from "@/core/errors/password";

@singleton()
export class DrizzleUserRepository implements UserRepository {
  constructor(
    @inject(DatabaseClientToken)
    private readonly client: DatabaseClient,
  ) {}

  private buildNewUser = (
    input: CreateUserInput,
    now: Date,
    id: string,
  ): NewUser & { id: string } => ({
    id,
    email: input.email.toLowerCase(),
    hashedPassword: input.hashedPassword,
    createdAt: now,
    updatedAt: now,
  });

  private buildNewProfile = (
    userId: string,
    input: CreateUserInput,
    now: Date,
  ): NewUserProfile => ({
    userId,
    username: this.normalizeUsername(input.username),
    bio: this.normalizeNullableText(input.bio, 30),
    avatarUrl: this.normalizeNullableText(input.avatarUrl),
    createdAt: now,
    updatedAt: now,
  });

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

  async create(input: CreateUserInput): Promise<UserWithProfile> {
    this.assertHashedPassword(input.hashedPassword);
    const now = new Date();
    const id = randomUUID();
    const userRecord = this.buildNewUser(input, now, id);
    const profileRecord = this.buildNewProfile(id, input, now);

    this.client.transaction((tx) => {
      tx.insert(users).values(userRecord).run();
      tx.insert(userProfiles).values(profileRecord).run();
    });

    const created = await this.findById(id);
    if (!created) {
      throw new Error("Failed to persist user record");
    }

    return created;
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
  }: UpdateUserPasswordInput): Promise<UserWithProfile | undefined> {
    this.assertHashedPassword(hashedPassword);
    const now = new Date();
    const result = await this.client
      .update(users)
      .set({ hashedPassword, updatedAt: now })
      .where(eq(users.id, id))
      .run();

    if (!result.changes) {
      return undefined;
    }

    return this.findById(id);
  }

  async updateProfile({
    id,
    username,
    bio,
    avatarUrl,
  }: UpdateUserProfileInput): Promise<UserWithProfile | undefined> {
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
      return this.findById(id);
    }

    const now = new Date();
    const didUpdate = this.client.transaction((tx) => {
      const profileResult = tx
        .update(userProfiles)
        .set({ ...updates, updatedAt: now })
        .where(eq(userProfiles.userId, id))
        .run();

      if (!profileResult.changes) {
        return false;
      }

      tx
        .update(users)
        .set({ updatedAt: now })
        .where(eq(users.id, id))
        .run();

      return true;
    });

    if (!didUpdate) {
      return undefined;
    }

    return this.findById(id);
  }
}
