import "reflect-metadata";
import { container } from "tsyringe";
import { TransactionManager } from "@/db/transaction-manager";

export function Transactional(): MethodDecorator {
  return (
    _target: object,
    _propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    const original = descriptor.value;
    if (typeof original !== "function") {
      return descriptor;
    }

    descriptor.value = function (...args: unknown[]): unknown {
      try {
        const manager = container.resolve(TransactionManager);
        return manager.runInTransaction(() => original.apply(this, args));
      } catch {
        return original.apply(this, args);
      }
    };

    return descriptor;
  };
}
