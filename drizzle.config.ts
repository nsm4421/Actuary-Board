import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: ".data/drizzle",
  schema: "./src/db/schema/index.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DB_FILE_NAME!,
  },
});
