import "reflect-metadata";
import { inject, singleton } from "tsyringe";
import type { UserService } from "@/service/user/user-service";
import { UserServiceToken } from "@/service/di";
import type {
  RegisterUserRequest,
  LoginUserRequest,
  UpdatePasswordRequest,
  UpdateProfileRequest,
  UserResponse,
} from "@/controller/user/dto";
import { toUserResponse } from "@/controller/user/serializers";

@singleton()
export class UserController {
  constructor(
    @inject(UserServiceToken)
    private readonly userService: UserService,
  ) {}

  async register(request: RegisterUserRequest): Promise<UserResponse> {
    const user = await this.userService.register({
      email: request.email,
      password: request.password,
      name: request.name ?? null,
    });
    return toUserResponse(user);
  }

  async getById(userId: string): Promise<UserResponse | undefined> {
    const user = await this.userService.getById(userId);
    return user ? toUserResponse(user) : undefined;
  }

  async getByEmail(email: string): Promise<UserResponse | undefined> {
    const user = await this.userService.getByEmail(email);
    return user ? toUserResponse(user) : undefined;
  }

  async changePassword(request: UpdatePasswordRequest): Promise<UserResponse> {
    const user = await this.userService.changePassword({
      userId: request.userId,
      password: request.password,
    });
    return toUserResponse(user);
  }

  async updateProfile(request: UpdateProfileRequest): Promise<UserResponse> {
    const user = await this.userService.updateProfile({
      userId: request.userId,
      name: request.name,
    });
    return toUserResponse(user);
  }

  async login(request: LoginUserRequest): Promise<UserResponse> {
    const user = await this.userService.authenticate(
      request.email,
      request.password,
    );
    return toUserResponse(user);
  }
}
