import { z } from 'zod';

const BlogFileSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const BlogFilesSchema = z.array(BlogFileSchema);
