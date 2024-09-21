import { PrismaClient } from "@prisma/client";

// Prevent multiple instances of PrismaClient in development
declare global {
  // Ensure that globalThis has the prisma property
  var prisma: PrismaClient | undefined;
}

// Initialize PrismaClient, either using globalThis or creating a new instance
export const db = globalThis.prisma || new PrismaClient();

// In development, assign PrismaClient to globalThis to avoid multiple instances
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}
