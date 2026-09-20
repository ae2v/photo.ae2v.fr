import "server-only";

import { GoogleAuth } from "google-auth-library";
import { getGoogleConfig } from "./config";

type DrivePermission = { type?: string; role?: string };
type PermissionContainer = { permissions?: DrivePermission[] };

export type DriveFolder = {
  id: string;
  name: string;
  webViewLink: string;
  createdTime?: string;
  modifiedTime?: string;
};

const publishedRoles = new Set(["reader", "commenter", "writer", "fileOrganizer", "organizer", "owner"]);

function isPublished(file: PermissionContainer): boolean {
  return file.permissions?.some(
    (permission) => permission.type === "anyone" && publishedRoles.has(permission.role ?? ""),
  ) ?? false;
}

async function getPermissions(fileId: string, accessToken: string): Promise<PermissionContainer> {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}/permissions?fields=permissions(type,role)&supportsAllDrives=true`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    },
  );
  if (!response.ok) throw new Error(`Permissions Drive inaccessibles (${response.status})`);
  return response.json() as Promise<PermissionContainer>;
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
  const accessToken = token.token;

  const rootIsPublished = isPublished(await getPermissions(config.folderId, accessToken));

  const files: DriveFolder[] = [];
  let pageToken: string | undefined;
  do {
    const params = new URLSearchParams({
      q: `'${config.folderId}' in parents and trashed = false and mimeType = 'application/vnd.google-apps.folder'`,
      fields: "nextPageToken,files(id,name,webViewLink,createdTime,modifiedTime)",
      pageSize: "1000",
      orderBy: "modifiedTime desc",
      supportsAllDrives: "true",
      includeItemsFromAllDrives: "true",
    });
    if (pageToken) params.set("pageToken", pageToken);
    const response = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`Google Drive a répondu ${response.status}: ${await response.text()}`);
    const data = (await response.json()) as { files?: DriveFolder[]; nextPageToken?: string };
    files.push(...(data.files ?? []));
    pageToken = data.nextPageToken;
  } while (pageToken);

  const publishedFiles = rootIsPublished
    ? files
    : (await Promise.all(files.map(async (file) => (
        isPublished(await getPermissions(file.id, accessToken)) ? file : null
      )))).filter((file): file is DriveFolder => file !== null);
  console.info(`Drive: ${files.length} sous-dossier(s) visible(s), ${publishedFiles.length} publié(s)`);

  return publishedFiles.map((file) => ({
    id: file.id,
    name: file.name,
    webViewLink: file.webViewLink,
    createdTime: file.createdTime,
    modifiedTime: file.modifiedTime,
  }));
}
