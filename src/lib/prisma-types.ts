/**
 * Centralized Prisma type utilities
 * This ensures all Prisma types and operations are properly typed in strict mode
 */

// Re-export Prisma package exports so runtime enums and types are available
// Prisma types removed - use type definitions from backend instead

export { prisma } from "./db";

// Type helpers for common operations
export type TransactionClient = Prisma.TransactionClient;
export type TransactionCallback<T> = (tx: Prisma.TransactionClient) => Promise<T>;
