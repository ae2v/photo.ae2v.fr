import { notFound } from "next/navigation";
import { getMissingConfig } from "@/lib/config";
import { database } from "@/lib/db";

export async function GET(_request: Request, context: RouteContext<"/[code]">) {
  const { code: rawCode } = await context.params;
  const code = rawCode.toUpperCase();
  if (!/^[A-HJ-NP-Z2-9]{4}$/.test(code) || getMissingConfig().includes("DATABASE_URL")) notFound();

  const rows = await database()`SELECT drive_folder_id FROM events WHERE short_code = ${code} LIMIT 1`;
  if (!rows.length) notFound();
  return Response.redirect(`https://drive.google.com/drive/folders/${rows[0].drive_folder_id}`, 307);
}
