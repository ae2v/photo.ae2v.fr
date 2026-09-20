import "server-only";

const requiredNames = [
  "GOOGLE_PROJECT_ID",
  "GOOGLE_CLIENT_EMAIL",
  "GOOGLE_PRIVATE_KEY",
  "GOOGLE_DRIVE_FOLDER_ID",
  "DATABASE_URL",
] as const;

export function getMissingConfig(): string[] {
  return requiredNames.filter((name) => !process.env[name]);
}

export function getGoogleConfig() {
  const missing = getMissingConfig().filter((name) => name !== "DATABASE_URL");
  if (missing.length) throw new Error(`Configuration Google incomplète : ${missing.join(", ")}`);
  return {
    projectId: process.env.GOOGLE_PROJECT_ID!,
    clientEmail: process.env.GOOGLE_CLIENT_EMAIL!,
    privateKey: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    folderId: process.env.GOOGLE_DRIVE_FOLDER_ID!,
  };
}

export function getDatabaseUrl(): string {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL est absente");
  return process.env.DATABASE_URL;
}
