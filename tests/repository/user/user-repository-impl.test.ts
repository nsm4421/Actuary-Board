import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { DrizzleUserRepository } from "@/repository/user/user-repository-impl";
import type {
  CreateUserInput,
  UpdateUserPasswordInput,
  UpdateUserProfileInput,
} from "@/repository/user/user-repository";
import { createTestDatabase } from "@tests/utils/test-database";
import { InvalidPasswordHashError } from "@/core/errors/password";

const HASHED_PASSWORD = "a".repeat(64);
const OTHER_HASHED_PASSWORD = "b".repeat(64);

describe("DrizzleUserRepository", () => {
  let repository: DrizzleUserRepository;
  let sqlite: ReturnType<typeof createTestDatabase>["sqlite"];

  beforeEach(() => {
    const { client, sqlite: connection } = createTestDatabase();
    repository = new DrizzleUserRepository(client);
    sqlite = connection;
  });

  afterEach(() => {
    sqlite.close();
  });

  const buildCreateInput = (
    overrides: Partial<CreateUserInput> = {},
  ): CreateUserInput => ({
    email: "User@Example.com",
    hashedPassword: HASHED_PASSWORD,
    name: "Tester",
    ...overrides,
  });

  describe("create()", () => {
    it("creates a new user with normalized email", async () => {
      const created = await repository.create(buildCreateInput());

      expect(created.id).toBeTruthy();
      expect(created.email).toBe("user@example.com");
      expect(created.name).toBe("Tester");
      expect(created.hashedPassword).toBe(HASHED_PASSWORD);
      expect(created.createdAt).toBeInstanceOf(Date);
      expect(created.updatedAt).toBeInstanceOf(Date);
    });

    it("throws when password hash is invalid", async () => {
      await expect(
        repository.create(
          buildCreateInput({
            hashedPassword: "not-a-hash",
          }),
        ),
      ).rejects.toBeInstanceOf(InvalidPasswordHashError);
    });

    it("throws when creating user with duplicate email", async () => {
      await repository.create(buildCreateInput());

      await expect(
        repository.create(buildCreateInput({ name: "Another" })),
      ).rejects.toThrow();
    });
  });

  describe("findByEmail()", () => {
    it("finds a user by email", async () => {
      const created = await repository.create(buildCreateInput());

      const found = await repository.findByEmail("user@example.com");

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.email).toBe(created.email);
    });

    it("returns undefined when finding by unknown email", async () => {
      const result = await repository.findByEmail("missing@example.com");
      expect(result).toBeUndefined();
    });
  });

  describe("findById()", () => {
    it("finds a user by id", async () => {
      const created = await repository.create(buildCreateInput());

      const found = await repository.findById(created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
    });

    it("returns undefined when finding by unknown id", async () => {
      const result = await repository.findById("missing-id");
      expect(result).toBeUndefined();
    });
  });

  describe("updatePassword()", () => {
    it("updates a user password", async () => {
      const created = await repository.create(buildCreateInput());
      const input: UpdateUserPasswordInput = {
        id: created.id,
        hashedPassword: OTHER_HASHED_PASSWORD,
      };

      const updated = await repository.updatePassword(input);

      expect(updated).toBeDefined();
      expect(updated?.hashedPassword).toBe(OTHER_HASHED_PASSWORD);
      expect(updated?.updatedAt.getTime()).toBeGreaterThanOrEqual(
        created.updatedAt.getTime(),
      );
    });

    it("returns undefined when updating password for unknown user", async () => {
      const result = await repository.updatePassword({
        id: "unknown",
        hashedPassword: HASHED_PASSWORD,
      });
      expect(result).toBeUndefined();
    });

    it("throws when new password hash is invalid", async () => {
      const created = await repository.create(buildCreateInput());

      await expect(
        repository.updatePassword({
          id: created.id,
          hashedPassword: "invalid",
        }),
      ).rejects.toBeInstanceOf(InvalidPasswordHashError);
    });
  });

  describe("updateProfile()", () => {
    it("updates a user profile", async () => {
      const created = await repository.create(buildCreateInput({ name: null }));
      const input: UpdateUserProfileInput = {
        id: created.id,
        name: "Updated Name",
      };

      const updated = await repository.updateProfile(input);

      expect(updated).toBeDefined();
      expect(updated?.name).toBe("Updated Name");
      expect(updated?.updatedAt.getTime()).toBeGreaterThanOrEqual(
        created.updatedAt.getTime(),
      );
    });

    it("returns undefined when updating profile for unknown user", async () => {
      const result = await repository.updateProfile({
        id: "missing",
        name: "Name",
      });
      expect(result).toBeUndefined();
    });
  });
});
