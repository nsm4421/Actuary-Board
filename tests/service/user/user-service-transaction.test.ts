import "reflect-metadata";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { container } from "tsyringe";
import { DefaultUserServiceImpl } from "@/service/user/user-service-impl";
import { DrizzleUserRepository } from "@/repository/user/user-repository-impl";
import type {
  InsertUserProfileInput,
  UserRepository,
} from "@/repository/user/user-repository";
import { createTestDatabase } from "@tests/utils/test-database";
import { DatabaseClientToken } from "@/db/tokens";
import type { DatabaseClient } from "@/db/client";
import { TransactionManager } from "@/db/transaction-manager";

describe("DefaultUserServiceImpl transactional behaviour", () => {
  let sqlite: ReturnType<typeof createTestDatabase>["sqlite"];
  let repository: UserRepository;
  let service: DefaultUserServiceImpl;

  beforeEach(() => {
    const { client, sqlite: connection } = createTestDatabase();
    sqlite = connection;

    container.registerInstance(DatabaseClientToken, client);
    container.registerInstance(TransactionManager, new TransactionManager(client));

    repository = new DrizzleUserRepository(client);
    service = new DefaultUserServiceImpl(repository);
  });

  afterEach(() => {
    container.reset();
    sqlite.close();
  });

  it("rolls back user insert when profile insertion fails", async () => {
    const client = container.resolve<DatabaseClient>(DatabaseClientToken);

    class FailingRepository extends DrizzleUserRepository {
      async insertUserProfile(input: InsertUserProfileInput): Promise<void> {
        throw new Error("Simulated profile failure");
      }
    }

    const failingRepository = new FailingRepository(client);
    const transactionalService = new DefaultUserServiceImpl(failingRepository);

    await expect(
      transactionalService.register({
        email: "rollback@example.com",
        password: "StrongPassword123!",
        username: "rollback",
        bio: null,
        avatarUrl: null,
      }),
    ).rejects.toThrow("Simulated profile failure");

    const verifier = new DrizzleUserRepository(client);
    const persisted = await verifier.findByEmail("rollback@example.com");
    expect(persisted).toBeUndefined();
  });
});
