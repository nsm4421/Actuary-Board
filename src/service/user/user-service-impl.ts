import { createHash } from "node:crypto";
import { inject, singleton } from "tsyringe";
import type {
  UserRepository,
  UserWithProfile,
  UpdateUserProfileInput as RepositoryUpdateUserProfileInput,
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

@singleton()
export class DefaultUserServiceImpl implements UserService {
  constructor(
    @inject(UserRepositoryToken)
    private readonly userRepository: UserRepository,
  ) {}

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
    const created = await this.userRepository.create({
      email,
      hashedPassword,
      username,
      bio,
      avatarUrl,
    });
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

  async changePassword(
    input: ChangeUserPasswordInput,
  ): Promise<UserModel> {
    const hashedPassword = this.hashPassword(input.password);
    const updated = await this.userRepository.updatePassword({
      id: input.userId,
      hashedPassword,
    });
    return this.ensureUser(updated, "Failed to update password: user not found");
  }

  async updateProfile(
    input: UpdateUserProfileInput,
  ): Promise<UserModel> {
    const repositoryInput: RepositoryUpdateUserProfileInput = {
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
    const updated = await this.userRepository.updateProfile(repositoryInput);
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
