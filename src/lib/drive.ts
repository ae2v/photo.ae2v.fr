import "server-only";

import { GoogleAuth } from "google-auth-library";
import { getGoogleConfig } from "./config";

type DrivePermission = { type?: string; role?: string };

export type DriveFolder = {
  id: string;
  name: string;
  webViewLink: string;
  modifiedTime?: string;
};

type DriveFile = DriveFolder & { permissions?: DrivePermission[] };
const publishedRoles = new Set(["reader", "commenter", "writer", "fileOrganizer", "organizer", "owner"]);

function isPublished(file: DriveFile): boolean {
  return file.permissions?.some(
    (permission) => permission.type === "anyone" && publishedRoles.has(permission.role ?? ""),
  ) ?? false;
}

export async function listPublishedFolders(): Promise<DriveFolder[]> {
  const config = getGoogleConfig();
  const auth = new GoogleAuth({
    credentials: {
      project_id: config.projectId,
      client_email: config.clientEmail,
      private_key: config.privateKey,
    },
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });
  const token = await (await auth.getClient()).getAccessToken();
  if (!token.token) throw new Error("Google n’a pas fourni de jeton d’accès");

  const files: DriveFile[] = [];
  let pageToken: string | undefined;
  do {
    const params = new URLSearchParams({
      q: `'${config.folderId}' in parents and trashed = false and mimeType = 'application/vnd.google-apps.folder'`,
      fields: "nextPageToken,files(id,name,webViewLink,modifiedTime,permissions(type,role))",
      pageSize: "1000",
      orderBy: "modifiedTime desc",
      supportsAllDrives: "true",
      includeItemsFromAllDrives: "true",
    });
    if (pageToken) params.set("pageToken", pageToken);
    const response = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`, {
      headers: { Authorization: `Bearer ${token.token}` },
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`Google Drive a répondu ${response.status}: ${await response.text()}`);
    const data = (await response.json()) as { files?: DriveFile[]; nextPageToken?: string };
    files.push(...(data.files ?? []));
    pageToken = data.nextPageToken;
  } while (pageToken);

  return files.filter(isPublished).map((file) => ({
    id: file.id,
    name: file.name,
    webViewLink: file.webViewLink,
    modifiedTime: file.modifiedTime,
  }));
}
