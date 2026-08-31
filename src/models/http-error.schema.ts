import { z } from "zod";

export const httpErrorSchema = z.object({
  statusCode: z.number(),
  error: z.string(),
  message: z.string(),
  code: z.string().optional(),
  errors: z
    .array(
      z.object({
        field: z.string(),
        message: z.string(),
      }),
    )
    .optional(),
});

export type HttpError = z.infer<typeof httpErrorSchema>;
