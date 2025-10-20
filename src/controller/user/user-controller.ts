import "reflect-metadata";
import { createHash } from "node:crypto";
import { inject, singleton } from "tsyringe";
import type { User } from "@/db/schema/users";
import type { UserService } from "@/service/user/user-service";
import { UserServiceToken } from "@/service/di";
import type {
  RegisterUserRequest,
  UpdatePasswordRequest,
  UpdateProfileRequest,
} from "@/controller/user/dto";

@singleton()
export class UserController {
  constructor(
    @inject(UserServiceToken)
    private readonly userService: UserService,
  ) {}

  async register(request: RegisterUserRequest): Promise<User> {
    return this.userService.register({
      email: request.email,
      hashedPassword: this.hashPassword(request.password),
      name: request.name ?? null,
    });
  }

  getById(userId: string): Promise<User | undefined> {
    return this.userService.getById(userId);
  }

  getByEmail(email: string): Promise<User | undefined> {
    return this.userService.getByEmail(email);
  }

  changePassword(request: UpdatePasswordRequest): Promise<User> {
    return this.userService.changePassword({
      id: request.userId,
      hashedPassword: this.hashPassword(request.password),
    });
  }

  updateProfile(request: UpdateProfileRequest): Promise<User> {
    return this.userService.updateProfile({
      id: request.userId,
      name: request.name,
    });
  }

  private hashPassword(password: string): string {
    return createHash("sha256").update(password).digest("hex");
  }
}
