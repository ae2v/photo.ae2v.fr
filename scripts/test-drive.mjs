import { GoogleAuth } from "google-auth-library";

const required = ["GOOGLE_PROJECT_ID", "GOOGLE_CLIENT_EMAIL", "GOOGLE_PRIVATE_KEY", "GOOGLE_DRIVE_FOLDER_ID"];
for (const name of required) {
  if (!process.env[name]) throw new Error(`${name} est absente de .env.local`);
}

const auth = new GoogleAuth({
  credentials: {
    project_id: process.env.GOOGLE_PROJECT_ID,
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/drive.readonly"],
});
const token = await (await auth.getClient()).getAccessToken();
const params = new URLSearchParams({
  q: `'${process.env.GOOGLE_DRIVE_FOLDER_ID}' in parents and trashed = false and mimeType = 'application/vnd.google-apps.folder'`,
  fields: "files(id,name,permissions(type,role))",
  pageSize: "1000",
  orderBy: "name",
  supportsAllDrives: "true",
  includeItemsFromAllDrives: "true",
});
const response = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`, {
  headers: { Authorization: `Bearer ${token.token}` },
});
if (!response.ok) throw new Error(`Google Drive ${response.status}: ${await response.text()}`);
const { files = [] } = await response.json();
console.table(files.map((file) => ({
  nom: file.name,
  id: file.id,
  public: file.permissions?.some((permission) => permission.type === "anyone") ?? false,
})));
console.log(`${files.length} sous-dossier(s) lisible(s).`);
