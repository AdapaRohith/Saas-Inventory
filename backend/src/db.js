import "dotenv/config";
import { existsSync, readFileSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.ts";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Add it to backend/.env.");
}

// Supabase's CA is not in Node's trust store, so it must be supplied to verify
// the server certificate. Download it from the Supabase dashboard.
const caPath = new URL("../certs/supabase-ca.crt", import.meta.url);

if (!existsSync(caPath)) {
  console.warn(
    "backend/certs/supabase-ca.crt not found: database connections will fail TLS verification.",
  );
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  ssl: { ca: existsSync(caPath) ? readFileSync(caPath, "utf8") : undefined },
});

export const prisma = new PrismaClient({ adapter });
