import "reflect-metadata";
import { describe, it, expect, beforeEach } from "vitest";
import { createHash } from "node:crypto";
import { DefaultUserServiceImpl } from "@/service/user/user-service-impl";
import type {
  ChangeUserPasswordInput,
  RegisterUserInput,
  UpdateUserProfileInput,
} from "@/service/user/user-service";
import type {
  InsertUserInput,
  InsertUserProfileInput,
  TouchUserInput,
  UpdateUserPasswordInput,
  UpdateUserProfileInput as RepositoryUpdateUserProfileInput,
  UserRepository,
  UserWithProfile,
} from "@/repository/user/user-repository";
import type { User } from "@/db/schema/users";
import type { UserProfile } from "@/db/schema/user-profiles";
import { InvalidCredentialsError } from "@/service/user/errors";
import { InvalidPasswordHashError } from "@/core/errors/password";

const RAW_PASSWORD = "StrongPassword123!";
const NEW_RAW_PASSWORD = "AnotherStrongPassword456!";

const hashPassword = (password: string) =>
  createHash("sha256").update(password).digest("hex");

class InMemoryUserRepository implements UserRepository {
  private users = new Map<string, User>();
  private profiles = new Map<string, UserProfile>();

  private assertHash(hash: string) {
    const sha256Regex = /^[a-f0-9]{64}$/i;
    if (!sha256Regex.test(hash)) {
      throw new InvalidPasswordHashError();
    }
  }

  private combineUser(user: User | undefined): UserWithProfile | undefined {
    if (!user) {
      return undefined;
    }
    const profile = this.profiles.get(user.id) ?? null;
    return {
      ...user,
      profile,
    };
  }

  async insertUser(input: InsertUserInput): Promise<void> {
    this.assertHash(input.hashedPassword);
    this.users.set(input.id, {
      id: input.id,
      email: input.email,
      hashedPassword: input.hashedPassword,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
    });
  }

  async insertUserProfile(input: InsertUserProfileInput): Promise<void> {
    this.profiles.set(input.userId, {
      userId: input.userId,
      username: input.username,
      bio: input.bio ?? null,
      avatarUrl: input.avatarUrl ?? null,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
    });
  }

  async touchUser(input: TouchUserInput): Promise<boolean> {
    const user = this.users.get(input.id);
    if (!user) {
      return false;
    }
    this.users.set(input.id, {
      ...user,
      updatedAt: input.updatedAt,
    });
    return true;
  }

  async findByEmail(email: string): Promise<UserWithProfile | undefined> {
    const user = [...this.users.values()].find(
      (candidate) => candidate.email.toLowerCase() === email.toLowerCase(),
    );
    return this.combineUser(user);
  }

  async findById(id: string): Promise<UserWithProfile | undefined> {
    const user = this.users.get(id);
    return this.combineUser(user);
  }

  async updatePassword(
    input: UpdateUserPasswordInput,
  ): Promise<boolean> {
    this.assertHash(input.hashedPassword);
    const user = this.users.get(input.id);
    if (!user) {
      return false;
    }
    this.users.set(input.id, {
      ...user,
      hashedPassword: input.hashedPassword,
      updatedAt: input.updatedAt,
    });
    return true;
  }

  async updateProfile(
    input: RepositoryUpdateUserProfileInput,
  ): Promise<boolean> {
    const profile = this.profiles.get(input.id);
    if (!profile) {
      return false;
    }
    this.profiles.set(input.id, {
      ...profile,
      username:
        input.username !== undefined ? input.username : profile.username,
      bio: input.bio !== undefined ? input.bio : profile.bio,
      avatarUrl:
        input.avatarUrl !== undefined ? input.avatarUrl : profile.avatarUrl,
      updatedAt: input.updatedAt,
    });
    return true;
  }
}

describe("DefaultUserServiceImpl", () => {
  let repository: InMemoryUserRepository;
  let service: DefaultUserServiceImpl;

  beforeEach(() => {
    repository = new InMemoryUserRepository();
    service = new DefaultUserServiceImpl(repository);
  });

  const registerUser = async (overrides: Partial<RegisterUserInput> = {}) =>
    service.register({
      email: "user@example.com",
      password: RAW_PASSWORD,
      username: "user",
      bio: null,
      avatarUrl: null,
      ...overrides,
    });

  describe("register", () => {
    it("hashes password before persisting", async () => {
      const result = await registerUser();

      const stored = await repository.findById(result.id);
      expect(stored?.hashedPassword).toBe(hashPassword(RAW_PASSWORD));
      expect(result.username).toBe("user");
      expect(result.bio).toBeNull();
    });

    it("normalizes email to lowercase", async () => {
      const result = await registerUser({ email: "User@Example.com" });

      expect(result.email).toBe("user@example.com");
    });
  });

  describe("changePassword", () => {
    it("hashes new password before updating", async () => {
      const user = await registerUser();

      const input: ChangeUserPasswordInput = {
        userId: user.id,
        password: NEW_RAW_PASSWORD,
      };

      const updated = await service.changePassword(input);

      expect(updated.id).toBe(user.id);
      const stored = await repository.findById(user.id);
      expect(stored?.hashedPassword).toBe(hashPassword(NEW_RAW_PASSWORD));
    });
  });

  describe("authenticate", () => {
    it("throws when password does not match stored hash", async () => {
      await registerUser();

      await expect(
        service.authenticate("user@example.com", NEW_RAW_PASSWORD),
      ).rejects.toBeInstanceOf(InvalidCredentialsError);
    });

    it("returns user when credentials are valid", async () => {
      const registered = await registerUser();

      const result = await service.authenticate("user@example.com", RAW_PASSWORD);

      expect(result.id).toBe(registered.id);
      expect(result.email).toBe("user@example.com");
      expect(result.username).toBe("user");
    });
  });

  describe("updateProfile", () => {
    it("updates user profile fields", async () => {
      const user = await registerUser();

      const input: UpdateUserProfileInput = {
        userId: user.id,
        username: "updated_user",
        bio: "Hello",
        avatarUrl: "https://example.com/avatar.png",
      };

      const updated = await service.updateProfile(input);

      expect(updated.username).toBe("updated_user");
      expect(updated.bio).toBe("Hello");
      expect(updated.avatarUrl).toBe("https://example.com/avatar.png");
    });
  });

  // transaction rollback scenario is covered in dedicated integration tests
});
