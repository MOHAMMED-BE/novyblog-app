import { z } from 'zod';

export const commentCreateSchema = z.object({
    content: z
        .string()
        .min(1, { message: 'Comment is required' })
        .max(5000, { message: 'Comment is too long (max 5000 chars)' })
});

export type CommentCreateValues = z.infer<typeof commentCreateSchema>;