import fs from "node:fs";
import path from "node:path";
import "dotenv/config";
import { defineConfig } from "prisma/config";

const envLocalPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envLocalPath)) {
  process.loadEnvFile(envLocalPath);
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url:
      process.env.DATABASE_URL ??
      "postgresql://postgres:postgres@localhost:5432/idriss_portfolio?schema=public",
  },
});
