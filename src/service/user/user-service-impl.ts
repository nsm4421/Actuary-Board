import { inject, singleton } from "tsyringe";
import type { User } from "@/db/schema/users";
import type {
  CreateUserInput,
  UpdateUserPasswordInput,
  UpdateUserProfileInput,
  UserRepository,
} from "@/repository/user/user-repository";
import { UserRepositoryToken } from "@/repository/di";
import type { UserService } from "@/service/user/user-service";

@singleton()
export class DefaultUserServiceImpl implements UserService {
  constructor(
    @inject(UserRepositoryToken)
    private readonly userRepository: UserRepository,
  ) {}

  async register(input: CreateUserInput): Promise<User> {
    const email = this.normalizeEmail(input.email);
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new Error("User already exists");
    }
    return this.userRepository.create({
      ...input,
      email,
    });
  }

  getByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findByEmail(this.normalizeEmail(email));
  }

  getById(id: string): Promise<User | undefined> {
    return this.userRepository.findById(id);
  }

  async changePassword(
    input: UpdateUserPasswordInput,
  ): Promise<User> {
    const updated = await this.userRepository.updatePassword(input);
    return this.ensureUser(updated, "Failed to update password: user not found");
  }

  async updateProfile(
    input: UpdateUserProfileInput,
  ): Promise<User> {
    const updated = await this.userRepository.updateProfile(input);
    return this.ensureUser(updated, "Failed to update profile: user not found");
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private ensureUser(user: User | undefined, message: string): User {
    if (!user) {
      throw new Error(message);
    }
    return user;
  }
}
