import "server-only";

import { neon } from "@neondatabase/serverless";
import { getDatabaseUrl } from "./config";

export function database() {
  return neon(getDatabaseUrl());
}
