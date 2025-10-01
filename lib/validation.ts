import { z } from "zod"

export const LoginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  rememberMe: z.boolean().optional(),
})

export const RegisterSchema = z
  .object({
    email: z.string().email().max(255),
    password: z
      .string()
      .min(8)
      .max(128)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Password must contain uppercase, lowercase, number, and special character",
      ),
    confirmPassword: z.string(),
    age: z.number().min(21).max(120), // Cannabis compliance
    acceptTerms: z.boolean().refine((val) => val === true, "Must accept terms"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

export const RedeemRewardSchema = z.object({
  rewardId: z.string().uuid(),
  amount: z.number().int().positive().max(10000),
  merchantId: z.string().uuid(),
})

export const WalletSignSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
  signature: z.string().min(1),
  message: z.string().min(1),
  nonce: z.string().uuid(),
})

export const PasskeyInitSchema = z.object({
  challenge: z.string().min(1),
  userHandle: z.string().optional(),
  rpId: z.string().min(1),
})

export function validateRequest<T>(schema: z.ZodSchema<T>) {
  return async (req: Request): Promise<T> => {
    try {
      const body = await req.json()
      return schema.parse(body)
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Response(
          JSON.stringify({
            error: "Validation failed",
            details: error.errors,
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        )
      }
      throw new Response("Invalid JSON", { status: 400 })
    }
  }
}
