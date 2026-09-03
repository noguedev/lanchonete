import { z } from "zod";

export const createProductSchema = z.object({
  name: z
    .string()
    .min(3, "O nome deve possuir pelo menos 3 caracteres.")
    .max(100, "O nome deve possuir no máximo 100 caracteres."),

  categoryId: z.uuid("Informe um id de categoria válido."),

  description: z
    .string()
    .max(1000, "A descrição deve possuir no máximo 1000 caracteres.")
    .optional(),

  price: z.coerce
    .number("Informe um preço válido.")
    .positive("O preço deve ser maior que zero."),

  isAvailable: z.enum(["true", "false"]).optional(),
});

export type CreateProductDTO = z.infer<typeof createProductSchema>;

export const productCreateBodySchema = z
  .object({
    name: z.string(),
    categoryId: z.string(),
    price: z.string(),
    description: z.string().optional(),
    isAvailable: z.string().optional(),
    image: z.any().optional().describe("Imagem do produto (JPEG ou PNG)"),
  })
  .nullable();

export const productUpdateBodySchema = z
  .object({
    name: z.string().optional(),
    categoryId: z.string().optional(),
    price: z.string().optional(),
    description: z.string().optional(),
    isAvailable: z.string().optional(),
    image: z.any().optional().describe("Imagem do produto (JPEG ou PNG)"),
  })
  .nullable();

export const updateProductSchema = z.object({
  name: z
    .string()
    .min(3, "O nome deve possuir pelo menos 3 caracteres.")
    .max(100, "O nome deve possuir no máximo 100 caracteres.")
    .optional(),

  categoryId: z.uuid("Informe um id de categoria válido.").optional(),

  description: z
    .string()
    .max(1000, "A descrição deve possuir no máximo 1000 caracteres.")
    .optional(),

  price: z.coerce
    .number("Informe um preço válido.")
    .positive("O preço deve ser maior que zero.")
    .optional(),

  isAvailable: z.enum(["true", "false"]).optional(),
});

export type UpdateProductDTO = z.infer<typeof updateProductSchema>;

export const productParamsSchema = z.object({
  id: z.uuid("Informe um id de produto válido."),
});

export type ProductParams = z.infer<typeof productParamsSchema>;

export const productSlugParamsSchema = z.object({
  slug: z.string().min(1, "Informe um slug válido."),
});

export type ProductSlugParams = z.infer<typeof productSlugParamsSchema>;

export const productListQuerySchema = z.object({
  page: z.coerce
    .number("Informe uma página válida.")
    .int("A página deve ser um número inteiro.")
    .min(1, "A página deve ser no mínimo 1.")
    .default(1),

  limit: z.coerce
    .number("Informe um limite válido.")
    .int("O limite deve ser um número inteiro.")
    .min(1, "O limite deve ser no mínimo 1.")
    .max(20, "O limite máximo é 20 produtos por página.")
    .default(12),
});

export type ProductListQuery = z.infer<typeof productListQuerySchema>;

export const productPublicSchema = z.object({
  id: z.string(),
  categoryId: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  price: z.number(),
  imageUrl: z.string().nullable(),
  isAvailable: z.boolean(),
});

export const productAdminSchema = productPublicSchema.extend({
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
});

export const productListResponseSchema = z.object({
  products: z.array(productPublicSchema),
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
});