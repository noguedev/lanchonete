import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { CartController } from "./cart.controller.js";
import {
  addCartItemSchema,
  updateCartItemSchema,
  cartItemParamsSchema,
} from "./cart.dtos.js";
import { authenticate } from "../../filter/authentication.js";
import { httpErrorSchema } from "../../models/http-error.schema.js";

const cartItemResponseSchema = z.object({
  productId: z.string(),
  name: z.string(),
  slug: z.string(),
  imageUrl: z.string().nullable(),
  quantity: z.number(),
  unitPrice: z.number(),
  currentPrice: z.number(),
  priceChanged: z.boolean(),
  subtotal: z.number(),
});

const cartResponseSchema = z.object({
  items: z.array(cartItemResponseSchema),
  total: z.number(),
  itemCount: z.number(),
});

const authGuard = [authenticate];

export async function cartRoutes(fastify: FastifyInstance) {
  const cartController = new CartController();

  fastify.get(
    "/",
    {
      preHandler: authGuard,
      schema: {
        tags: ["Cart"],
        summary: "Retornar o carrinho do usuário",
        description:
          "Retorna o carrinho do usuário autenticado, com o preço atual dos produtos e a indicação de alteração de preço.",
        security: [{ bearerAuth: [] }],
        response: {
          200: z.object({ cart: cartResponseSchema }),
          401: httpErrorSchema,
          500: httpErrorSchema,
        },
      },
    },
    cartController.get.bind(cartController),
  );

  fastify.post(
    "/items",
    {
      preHandler: authGuard,
      schema: {
        tags: ["Cart"],
        summary: "Adicionar um produto ao carrinho",
        description:
          "Adiciona um produto ao carrinho do usuário autenticado. Se já existir, incrementa a quantidade. O preço é registrado como snapshot no momento da adição.",
        security: [{ bearerAuth: [] }],
        body: addCartItemSchema,
        response: {
          201: z.null(),
          400: httpErrorSchema,
          401: httpErrorSchema,
          404: httpErrorSchema,
          500: httpErrorSchema,
        },
      },
    },
    cartController.addItem.bind(cartController),
  );

  fastify.patch(
    "/items/:productId",
    {
      preHandler: authGuard,
      schema: {
        tags: ["Cart"],
        summary: "Atualizar a quantidade de um item",
        description: "Atualiza a quantidade de um item do carrinho do usuário autenticado.",
        security: [{ bearerAuth: [] }],
        params: cartItemParamsSchema,
        body: updateCartItemSchema,
        response: {
          200: z.object({ cart: cartResponseSchema }),
          400: httpErrorSchema,
          401: httpErrorSchema,
          404: httpErrorSchema,
          500: httpErrorSchema,
        },
      },
    },
    cartController.updateItem.bind(cartController),
  );

  fastify.delete(
    "/items/:productId",
    {
      preHandler: authGuard,
      schema: {
        tags: ["Cart"],
        summary: "Remover um item do carrinho",
        description: "Remove um item do carrinho do usuário autenticado.",
        security: [{ bearerAuth: [] }],
        params: cartItemParamsSchema,
        response: {
          200: z.object({ cart: cartResponseSchema }),
          400: httpErrorSchema,
          401: httpErrorSchema,
          404: httpErrorSchema,
          500: httpErrorSchema,
        },
      },
    },
    cartController.removeItem.bind(cartController),
  );
}
