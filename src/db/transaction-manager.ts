import { AsyncLocalStorage } from "node:async_hooks";
import { inject, singleton } from "tsyringe";
import type { DatabaseClient } from "@/db/client";
import { DatabaseClientToken } from "@/db/di";

type TransactionState = {
  depth: number;
};

const transactionStorage = new AsyncLocalStorage<TransactionState>();

type RawDatabase = {
  exec(sql: string): unknown;
};

const toRawClient = (client: DatabaseClient): RawDatabase =>
  (client as unknown as { $client: RawDatabase }).$client;

@singleton()
export class TransactionManager {
  constructor(
    @inject(DatabaseClientToken)
    private readonly client: DatabaseClient,
  ) {}

  async runInTransaction<T>(operation: () => T | Promise<T>): Promise<T> {
    const existing = transactionStorage.getStore();
    if (!existing) {
      return transactionStorage.run({ depth: 0 }, async () =>
        this.executeTopLevel(operation),
      );
    }
    return this.executeNested(existing, operation);
  }

  private async executeTopLevel<T>(
    operation: () => T | Promise<T>,
  ): Promise<T> {
    const raw = toRawClient(this.client);
    raw.exec("BEGIN");
    try {
      const result = await operation();
      raw.exec("COMMIT");
      return result;
    } catch (error) {
      raw.exec("ROLLBACK");
      throw error;
    }
  }

  private async executeNested<T>(
    state: TransactionState,
    operation: () => T | Promise<T>,
  ): Promise<T> {
    const raw = toRawClient(this.client);
    const savepointId = state.depth + 1;
    const savepoint = `sp_${savepointId}`;
    state.depth = savepointId;
    raw.exec(`SAVEPOINT ${savepoint}`);
    try {
      const result = await operation();
      raw.exec(`RELEASE SAVEPOINT ${savepoint}`);
      return result;
    } catch (error) {
      raw.exec(`ROLLBACK TO SAVEPOINT ${savepoint}`);
      throw error;
    } finally {
      state.depth -= 1;
    }
  }
}
