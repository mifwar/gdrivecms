import { drive_v3, google } from "googleapis";
import { BlogFilesSchema } from "@/common/schemas/schema";

interface BlogFiles {
  id: string;
  name: string;
}

const GetItems = async (): Promise<BlogFiles[]> => {
  const env_in_string = String(process.env.GOOGLE_DRIVE_SERVICE);
  const key = JSON.parse(env_in_string);

  const jwtClient = new google.auth.JWT(
    key.client_email,
    "",
    key.private_key,
    ["https://www.googleapis.com/auth/drive"]
  );

  await jwtClient.authorize();

  const drive = google.drive({ version: "v3", auth: jwtClient });

  const folderId = process.env.FOLDER_ID;
  
  const response = await drive.files.list({
    q: `'${folderId}' in parents and name contains '.md'`,
    fields: "files(id, name)",
  });

  const result = BlogFilesSchema.safeParse(response.data.files);

  if (result.success) {
    return result.data;
  } else {
    console.error("Validation failed", result.error);
    return [];
  }
};

const GetFileId = async (drive: drive_v3.Drive, fileName: string): Promise<string> => {
  try {
    const response = await drive.files.list({
      q: `name = '${fileName}'`,
      fields: "files(id, name)",
    });
  
    const files = response.data.files;
    
    if (!files || files?.length === 0) {
      throw new Error("No files found");
    } else {
      return files[0].id ?? '';
    }

  } catch {
    console.error("no file id");
    return "";
  }
}

const GetFileContent = async (fileName: string) => {
  const env_in_string = String(process.env.GOOGLE_DRIVE_SERVICE);
  const key = JSON.parse(env_in_string);

  const jwtClient = new google.auth.JWT(key.client_email, "", key.private_key, [
    "https://www.googleapis.com/auth/drive",
  ]);

  await jwtClient.authorize();

  const drive = google.drive({ version: "v3", auth: jwtClient });

  const fileId = await GetFileId(drive, fileName);  

  try {
    const response = await drive.files.get({
      fileId: fileId,
      alt: 'media'
    }, { responseType: 'stream' });

    let fileContent: string = '';
    response.data.on('data', chunk => fileContent += chunk);
    return new Promise((resolve, reject) => {
      response.data.on('end', () => resolve(fileContent));
      response.data.on('error', err => reject(err));
    });

  } catch(error) {
    console.error("error:", error);
    throw error;
  }
  
};

export const dynamicParams = false;

export async function generateStaticParams() {
  const items = await GetItems();
  return items.map((item) => ({ slug: item.name }));
}

const Page = async ({ params }: { params: { slug: string } }) => {
  const data = await GetFileContent(params.slug) as string;
  return <div>My Post: {data}</div>;
}

export default Page;