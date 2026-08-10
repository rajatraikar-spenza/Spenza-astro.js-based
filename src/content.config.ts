import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    date: z.union([z.string(), z.date()]).optional(),
    image: z.string().optional(),
    category: z.string().optional(),
  }),
});

export const collections = { blog };
