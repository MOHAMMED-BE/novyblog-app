import { z } from "zod";

const envSchema = z.object({
    apiUrl: z.url(),
    uploadUrl: z.url(),
    SECRET_KEY: z.string(),
    TOKEN_KEY: z.string(),
    USER_KEY: z.string(),
    REFRESH_TOKEN_KEY: z.string()
});

export const env = envSchema.parse({
    apiUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    uploadUrl: process.env.NEXT_PUBLIC_UPLOAD_URL,
    SECRET_KEY: process.env.NEXT_PUBLIC_SECRET_KEY,
    TOKEN_KEY: process.env.NEXT_PUBLIC_TOKEN_KEY,
    USER_KEY: process.env.NEXT_PUBLIC_USER_KEY,
    REFRESH_TOKEN_KEY: process.env.NEXT_PUBLIC_REFRESH_TOKEN_KEY,
});
