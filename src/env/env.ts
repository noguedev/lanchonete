import z from "zod";
import "dotenv/config";

const envSchema = z.object({
  PORT: z.string().transform(Number).default(3000),
  DATABASE_URL: z.string(),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

export const env = await envSchema.parse(process.env);
