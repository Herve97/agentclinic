import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import * as schema from "./schema";

// Decision D1: no .env is required. An unset DATABASE_URL means a local file,
// so a fresh clone runs with no configuration. Phase 12 points this at Turso
// by setting the variable, with no code change.
export const databaseUrl = process.env.DATABASE_URL ?? "file:local.db";

export const client = createClient({ url: databaseUrl });
export const db = drizzle(client, { schema });
