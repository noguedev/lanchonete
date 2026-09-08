import { z } from "zod";

export const addCartItemSchema = z.object({
  productId: z.uuid("Informe um id de produto válido."),

  quantity: z.coerce
    .number("Informe uma quantidade válida.")
    .int("A quantidade deve ser um número inteiro.")
    .min(1, "A quantidade deve ser no mínimo 1.")
    .max(99, "A quantidade máxima é 99.")
    .default(1),
});

export type AddCartItemDTO = z.infer<typeof addCartItemSchema>;

export const updateCartItemSchema = z.object({
  quantity: z.coerce
    .number("Informe uma quantidade válida.")
    .int("A quantidade deve ser um número inteiro.")
    .min(1, "A quantidade deve ser no mínimo 1.")
    .max(99, "A quantidade máxima é 99."),
});

export type UpdateCartItemDTO = z.infer<typeof updateCartItemSchema>;

export const cartItemParamsSchema = z.object({
  productId: z.uuid("Informe um id de produto válido."),
});

export type CartItemParams = z.infer<typeof cartItemParamsSchema>;
