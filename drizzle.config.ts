import { type Config } from "drizzle-kit";

import { env } from "~/env";

export default {
  schema: "./src/server/db/schema.ts",
  out: "./src/server/db/migrations", // <-- ADD THIS LINE
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  tablesFilter: ["menu-hub_*"],
} satisfies Config;