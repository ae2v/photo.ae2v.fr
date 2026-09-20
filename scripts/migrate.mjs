import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL est absente de .env.local");

const sql = neon(process.env.DATABASE_URL);
await sql`
  CREATE TABLE IF NOT EXISTS events (
    id BIGSERIAL PRIMARY KEY,
    drive_folder_id TEXT NOT NULL UNIQUE,
    short_code VARCHAR(4) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT short_code_format CHECK (short_code ~ '^[A-HJ-NP-Z2-9]{4}$')
  )
`;
await sql`CREATE INDEX IF NOT EXISTS events_last_seen_idx ON events (last_seen_at DESC)`;
console.log("Migration terminée : table events prête.");
