import { z } from "zod";

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(3, "O nome deve possuir pelo menos 3 caracteres.")
    .max(100, "O nome deve possuir no máximo 100 caracteres."),

  slug: z
    .string()
    .min(3, "O slug deve possuir pelo menos 3 caracteres.")
    .max(100, "O slug deve possuir no máximo 100 caracteres.")
    .optional(),

  description: z
    .string()
    .max(500, "A descrição deve possuir no máximo 500 caracteres.")
    .optional(),
});

export type CreateCategoryDTO = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = z.object({
  name: z
    .string()
    .min(3, "O nome deve possuir pelo menos 3 caracteres.")
    .max(100, "O nome deve possuir no máximo 100 caracteres."),

  description: z
    .string()
    .max(500, "A descrição deve possuir no máximo 500 caracteres.")
    .optional(),
});

export type UpdateCategoryDTO = z.infer<typeof updateCategorySchema>;

export const categoryParamsSchema = z.object({
  id: z.uuid("Informe um id de categoria válido."),
});

export type CategoryParams = z.infer<typeof categoryParamsSchema>;
