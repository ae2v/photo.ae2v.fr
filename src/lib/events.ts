import "server-only";

import { randomInt } from "node:crypto";
import { unstable_cache } from "next/cache";
import { getMissingConfig } from "./config";
import { database } from "./db";
import { listPublishedFolders } from "./drive";

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export type PublicEvent = {
  driveFolderId: string;
  name: string;
  shortCode: string;
  driveUrl: string;
  modifiedTime?: string;
};

export type EventsState =
  | { status: "ready"; events: PublicEvent[] }
  | { status: "unconfigured"; missing: string[] }
  | { status: "error" };

function generateCode(): string {
  return Array.from({ length: 4 }, () => alphabet[randomInt(alphabet.length)]).join("");
}

async function ensureShortCode(driveFolderId: string): Promise<string> {
  const sql = database();
  for (let attempt = 0; attempt < 12; attempt += 1) {
    try {
      const code = generateCode();
      const rows = await sql`
        INSERT INTO events (drive_folder_id, short_code, last_seen_at)
        VALUES (${driveFolderId}, ${code}, NOW())
        ON CONFLICT (drive_folder_id) DO UPDATE SET last_seen_at = NOW()
        RETURNING short_code
      `;
      return String(rows[0].short_code);
    } catch (error) {
      if ((error as { code?: string }).code !== "23505") throw error;
    }
  }
  throw new Error("Impossible de générer un code court unique");
}

async function loadEvents(): Promise<PublicEvent[]> {
  const folders = await listPublishedFolders();
  return Promise.all(folders.map(async (folder) => ({
    driveFolderId: folder.id,
    name: folder.name,
    shortCode: await ensureShortCode(folder.id),
    driveUrl: folder.webViewLink || `https://drive.google.com/drive/folders/${folder.id}`,
    modifiedTime: folder.modifiedTime,
  })));
}

const getCachedEvents = unstable_cache(loadEvents, ["ae2v-public-photo-events-v2"], {
  revalidate: 600,
  tags: ["photo-events"],
});

export async function getEventsState(): Promise<EventsState> {
  const missing = getMissingConfig();
  if (missing.length) return { status: "unconfigured", missing };
  try {
    return { status: "ready", events: await getCachedEvents() };
  } catch (error) {
    console.error("Chargement des événements impossible", error);
    return { status: "error" };
  }
}
