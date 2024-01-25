import { google } from "googleapis";
import { BlogFilesSchema } from "@/common/schemas/schema";

import Link from "next/link";

interface BlogFiles {
  id: string;
  name: string;
}

const GetData = async (): Promise<BlogFiles[]> => {
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

const Blog = async () => {
  const data = await GetData();

  return (
    <div>
      <ol>
        {data.map((item) => (
          <li key={item.id}>
            <Link href={`/blog/${item.name}`}>
              <p>{item.name}</p>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default Blog;
