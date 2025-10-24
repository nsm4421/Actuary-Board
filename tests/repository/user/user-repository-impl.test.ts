import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { randomUUID } from "node:crypto";
import { DrizzleUserRepository } from "@/repository/user/user-repository-impl";
import type {
  InsertUserInput,
  InsertUserProfileInput,
  TouchUserInput,
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

  const buildInsertInputs = (
    overrides: Partial<InsertUserInput & InsertUserProfileInput> = {},
  ): {
    user: InsertUserInput;
    profile: InsertUserProfileInput;
  } => {
    const now = new Date();
    const id = randomUUID();
    return {
      user: {
        id,
        email: "User@Example.com",
        hashedPassword: HASHED_PASSWORD,
        createdAt: now,
        updatedAt: now,
        ...overrides,
      },
      profile: {
        userId: id,
        username: "tester",
        bio: "Hello",
        avatarUrl: null,
        createdAt: now,
        updatedAt: now,
        ...overrides,
      },
    };
  };

  const createUser = async (
    overrides: Partial<InsertUserInput & InsertUserProfileInput> = {},
  ) => {
    const { user, profile } = buildInsertInputs(overrides);
    await repository.insertUser(user);
    await repository.insertUserProfile(profile);
    return repository.findById(user.id);
  };

  describe("insertUser() and insertUserProfile()", () => {
    it("creates a new user with normalized email", async () => {
      const { user, profile } = buildInsertInputs();
      await repository.insertUser(user);
      await repository.insertUserProfile(profile);

      const created = await repository.findById(user.id);
      expect(created?.id).toBeTruthy();
      expect(created?.email).toBe("user@example.com");
      expect(created?.hashedPassword).toBe(HASHED_PASSWORD);
      expect(created?.profile?.username).toBe("tester");
      expect(created?.profile?.bio).toBe("Hello");
      expect(created?.createdAt).toBeInstanceOf(Date);
      expect(created?.updatedAt).toBeInstanceOf(Date);
    });

    it("throws when password hash is invalid", async () => {
      const { user } = buildInsertInputs({
        hashedPassword: "not-a-hash",
      });
      await expect(repository.insertUser(user)).rejects.toBeInstanceOf(
        InvalidPasswordHashError,
      );
    });

    it("throws when creating user with duplicate email", async () => {
      const { user, profile } = buildInsertInputs();
      await repository.insertUser(user);
      await repository.insertUserProfile(profile);

      await expect(repository.insertUser(user)).rejects.toThrow();
    });
  });

  describe("findByEmail()", () => {
    it("finds a user by email", async () => {
      const created = await createUser();

      const found = await repository.findByEmail("user@example.com");

      expect(found).toBeDefined();
      expect(found?.id).toBe(created?.id);
      expect(found?.email).toBe(created?.email);
      expect(found?.profile?.username).toBe("tester");
    });

    it("returns undefined when finding by unknown email", async () => {
      const result = await repository.findByEmail("missing@example.com");
      expect(result).toBeUndefined();
    });
  });

  describe("findById()", () => {
    it("finds a user by id", async () => {
      const created = await createUser();

      const found = await repository.findById(created!.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created?.id);
      expect(found?.profile?.username).toBe("tester");
    });

    it("returns undefined when finding by unknown id", async () => {
      const result = await repository.findById("missing-id");
      expect(result).toBeUndefined();
    });
  });

  describe("updatePassword()", () => {
    it("updates a user password", async () => {
      const created = await createUser();
      const input: UpdateUserPasswordInput = {
        id: created!.id,
        hashedPassword: OTHER_HASHED_PASSWORD,
        updatedAt: new Date(),
      };

      const previousUpdatedAt = created!.updatedAt.getTime();
      const success = await repository.updatePassword(input);
      expect(success).toBe(true);

      const updated = await repository.findById(created!.id);
      expect(updated?.hashedPassword).toBe(OTHER_HASHED_PASSWORD);
      expect(updated?.updatedAt.getTime()).toBeGreaterThanOrEqual(
        previousUpdatedAt,
      );
      expect(updated?.profile?.username).toBe("tester");
    });

    it("returns false when updating password for unknown user", async () => {
      const result = await repository.updatePassword({
        id: "unknown",
        hashedPassword: HASHED_PASSWORD,
        updatedAt: new Date(),
      });
      expect(result).toBe(false);
    });

    it("throws when new password hash is invalid", async () => {
      const created = await createUser();

      await expect(
        repository.updatePassword({
          id: created!.id,
          hashedPassword: "invalid",
          updatedAt: new Date(),
        }),
      ).rejects.toBeInstanceOf(InvalidPasswordHashError);
    });
  });

  describe("updateProfile()", () => {
    it("updates profile fields", async () => {
      const created = await createUser();
      const input: UpdateUserProfileInput = {
        id: created!.id,
        username: "newtester",
        bio: "Updated bio",
        avatarUrl: "https://example.com/avatar.png",
        updatedAt: new Date(),
      };

      const previousProfileUpdatedAt =
        created?.profile?.updatedAt.getTime() ?? 0;
      const success = await repository.updateProfile(input);
      expect(success).toBe(true);

      const updatedProfile = await repository.findById(created!.id);
      expect(updatedProfile?.profile?.username).toBe("newtester");
      expect(updatedProfile?.profile?.bio).toBe("Updated bio");
      expect(updatedProfile?.profile?.avatarUrl).toBe(
        "https://example.com/avatar.png",
      );
      expect(updatedProfile?.profile?.updatedAt.getTime()).toBeGreaterThanOrEqual(
        previousProfileUpdatedAt,
      );
    });

    it("returns false when profile is missing", async () => {
      const result = await repository.updateProfile({
        id: "missing",
        username: "unknown",
        updatedAt: new Date(),
      });
      expect(result).toBe(false);
    });
  });

  describe("touchUser()", () => {
    it("updates user timestamp when record exists", async () => {
      const created = await createUser();
      const payload: TouchUserInput = {
        id: created!.id,
        updatedAt: new Date(),
      };

      const previousUpdatedAt = created!.updatedAt.getTime();
      const touched = await repository.touchUser(payload);
      expect(touched).toBe(true);

      const refreshed = await repository.findById(created!.id);
      expect(refreshed?.updatedAt.getTime()).toBeGreaterThanOrEqual(
        previousUpdatedAt,
      );
    });

    it("returns false when record is missing", async () => {
      const result = await repository.touchUser({
        id: "missing",
        updatedAt: new Date(),
      });
      expect(result).toBe(false);
    });
  });
});
