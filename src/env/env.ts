import z from "zod";
import "dotenv/config";

const envSchema = z.object({
  PORT: z.string().transform(Number).default(3000),
  DATABASE_URL: z.string(),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string(),
  REFRESH_TOKEN_EXPIRES_IN: z.string(),
});

export const env = envSchema.parse(process.env);
