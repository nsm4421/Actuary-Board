import { createHash } from "node:crypto";
import { inject, singleton } from "tsyringe";
import type { User } from "@/db/schema/users";
import type {
  UpdateUserProfileInput as RepositoryUpdateUserProfileInput,
  UserRepository,
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
    const created = await this.userRepository.create({
      email,
      hashedPassword,
      name: input.name ?? null,
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
      name: input.name,
    };
    const updated = await this.userRepository.updateProfile(repositoryInput);
    return this.ensureUser(updated, "Failed to update profile: user not found");
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private ensureUser(user: User | undefined, message: string): UserModel {
    if (!user) {
      throw new Error(message);
    }
    return toUserModel(user);
  }

  private hashPassword(password: string): string {
    return createHash("sha256").update(password).digest("hex");
  }
}
