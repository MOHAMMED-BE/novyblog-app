import z from "zod";

export const registerSchema =
    z.object({
        fullName: z.string().min(2, '').max(80, ''),
        email: z.email({ message: '' }),
        password: z.string().min(6, '').max(128, ''),
    })

export const loginSchema =
    z.object({
        email: z.string().email({ message: '' }),
        password: z.string().min(6, '').max(128, ''),
    })