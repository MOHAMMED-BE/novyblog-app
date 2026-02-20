import { z } from 'zod';

export const articleStatusEnum = z.enum(['DRAFT', 'PUBLISHED']);

export const articleUpsertSchema = z.object({
    title: z.string().min(2, { message: 'Title is required' }).max(220, { message: 'Max 220 characters' }),
    excerpt: z.string().max(600, { message: 'Max 600 characters' }).optional().or(z.literal('')),
    content: z.string().min(1, { message: 'Content is required' }),
    keywords: z.string().max(500, { message: 'Max 500 characters' }).optional().or(z.literal('')),
    status: articleStatusEnum,
    categoryId: z.preprocess(
        (v) => (v === '' || v === null || v === undefined ? undefined : Number(v)),
        z.number().int().positive().optional()
    ),
    thumbnail: z.any().optional()
});

export type ArticleUpsertValues = z.infer<typeof articleUpsertSchema>;