import { createHash, randomUUID } from "node:crypto";
import { inject, singleton } from "tsyringe";
import type {
  UserRepository,
  UserWithProfile,
} from "@/repository/user/user-repository";
import { UserRepositoryToken } from "@/repository/di";
import type {
  ChangeUserPasswordInput,
  RegisterUserInput,
  UpdateUserProfileInput,
  UserService,
} from "@/service/user/user-service";
import { InvalidCredentialsError } from "@/service/user/errors";
import { toUserModel } from "@/service/user/mappers";
import type { UserModel } from "@/model/user/user";
import { Transactional } from "@/core/decorators/transactional";

@singleton()
export class DefaultUserServiceImpl implements UserService {
  constructor(
    @inject(UserRepositoryToken)
    private readonly userRepository: UserRepository,
  ) {}

  @Transactional()
  async register(input: RegisterUserInput): Promise<UserModel> {
    const email = this.normalizeEmail(input.email);
    const hashedPassword = this.hashPassword(input.password);
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new Error("User already exists");
    }
    const username = this.normalizeUsername(input.username);
    const bio = this.normalizeNullableText(input.bio, 30);
    const avatarUrl = this.normalizeNullableText(input.avatarUrl);
    const now = new Date();
    const id = randomUUID();

    await this.userRepository.insertUser({
      id,
      email,
      hashedPassword,
      createdAt: now,
      updatedAt: now,
    });

    await this.userRepository.insertUserProfile({
      userId: id,
      username,
      bio,
      avatarUrl,
      createdAt: now,
      updatedAt: now,
    });

    const created = await this.userRepository.findById(id);
    if (!created) {
      throw new Error("Failed to persist user record");
    }
    return toUserModel(created);
  }

  async getByEmail(email: string): Promise<UserModel | undefined> {
    const user = await this.userRepository.findByEmail(
      this.normalizeEmail(email),
    );
    return user ? toUserModel(user) : undefined;
  }

  async getById(id: string): Promise<UserModel | undefined> {
    const user = await this.userRepository.findById(id);
    return user ? toUserModel(user) : undefined;
  }

  async authenticate(email: string, password: string): Promise<UserModel> {
    const hashedPassword = this.hashPassword(password);
    const user = await this.userRepository.findByEmail(
      this.normalizeEmail(email),
    );

    if (!user || user.hashedPassword !== hashedPassword) {
      throw new InvalidCredentialsError();
    }

    return toUserModel(user);
  }

  @Transactional()
  async changePassword(
    input: ChangeUserPasswordInput,
  ): Promise<UserModel> {
    const hashedPassword = this.hashPassword(input.password);
    const updatedAt = new Date();
    const success = await this.userRepository.updatePassword({
      id: input.userId,
      hashedPassword,
      updatedAt,
    });
    if (!success) {
      throw new Error("Failed to update password: user not found");
    }

    const refreshed = await this.userRepository.findById(input.userId);
    return this.ensureUser(refreshed, "Failed to update password: user not found");
  }

  @Transactional()
  async updateProfile(
    input: UpdateUserProfileInput,
  ): Promise<UserModel> {
    const updatedAt = new Date();
    const payload = {
      id: input.userId,
      username:
        input.username !== undefined
          ? this.normalizeUsername(input.username)
          : undefined,
      bio:
        input.bio !== undefined
          ? this.normalizeNullableText(input.bio, 30)
          : undefined,
      avatarUrl:
        input.avatarUrl !== undefined
          ? this.normalizeNullableText(input.avatarUrl)
          : undefined,
    };
    const didUpdate = await this.userRepository.updateProfile({
      ...payload,
      updatedAt,
    });

    if (!didUpdate) {
      throw new Error("Failed to update profile: user not found");
    }

    const touched = await this.userRepository.touchUser({
      id: input.userId,
      updatedAt,
    });

    if (!touched) {
      throw new Error("Failed to update profile: user not found");
    }

    const updated = await this.userRepository.findById(input.userId);
    return this.ensureUser(updated, "Failed to update profile: user not found");
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
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

  private ensureUser(
    user: UserWithProfile | undefined,
    message: string,
  ): UserModel {
    if (!user) {
      throw new Error(message);
    }
    return toUserModel(user);
  }

  private hashPassword(password: string): string {
    return createHash("sha256").update(password).digest("hex");
  }
}
