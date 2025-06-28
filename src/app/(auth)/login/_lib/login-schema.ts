import { z } from "zod"

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Please enter your email")
    .email("Invalid email format"),
  password: z.string().min(1, "Please enter your password"),
})

export type LoginValues = z.infer<typeof loginSchema>
