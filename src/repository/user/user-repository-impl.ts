import {
  CreateUserInput,
  UpdateUserPasswordInput,
  UpdateUserProfileInput,
  UserRepository,
} from "./user-repository";
import "reflect-metadata";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { inject, singleton } from "tsyringe";
import type { DatabaseClient } from "@/db/client";
import { users, type NewUser, type User } from "@/db/schema/users";
import { DatabaseClientToken } from "@/db/di";

@singleton()
export class DrizzleUserRepository implements UserRepository {
  constructor(
    @inject(DatabaseClientToken)
    private readonly client: DatabaseClient
  ) {}

  private buildNewUser = (input: CreateUserInput): NewUser & { id: string } => {
    const now = new Date();
    return {
      id: randomUUID(),
      email: input.email.toLowerCase(),
      name: input.name ?? null,
      hashedPassword: input.hashedPassword,
      createdAt: now,
      updatedAt: now,
    };
  };

  async create(input: CreateUserInput): Promise<User> {
    const record = this.buildNewUser(input);
    this.client.transaction((tx) => {
      tx.insert(users).values(record).run();
    });

    const created = await this.findById(record.id);
    if (!created) {
      throw new Error("Failed to persist user record");
    }

    return created;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const normalized = email.toLowerCase();
    return this.client.query.users.findFirst({
      where: (table, { eq: equals }) => equals(table.email, normalized),
    });
  }

  async findById(id: string): Promise<User | undefined> {
    return this.client.query.users.findFirst({
      where: (table, { eq: equals }) => equals(table.id, id),
    });
  }

  async updatePassword({
    id,
    hashedPassword,
  }: UpdateUserPasswordInput): Promise<User | undefined> {
    const now = new Date();
    await this.client
      .update(users)
      .set({ hashedPassword, updatedAt: now })
      .where(eq(users.id, id));
    return this.findById(id);
  }

  async updateProfile({
    id,
    name,
  }: UpdateUserProfileInput): Promise<User | undefined> {
    const now = new Date();
    await this.client
      .update(users)
      .set({ name, updatedAt: now })
      .where(eq(users.id, id));
    return this.findById(id);
  }
}
