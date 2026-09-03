import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { ProductController } from "./product.controller.js";
import {
  productParamsSchema,
  productSlugParamsSchema,
  productListQuerySchema,
  productCreateBodySchema,
  productUpdateBodySchema,
  productAdminSchema,
  productListResponseSchema,
} from "./product.dtos.js";
import { authenticate } from "../../filter/authentication.js";
import { authorize } from "../../filter/authorization.js";
import { httpErrorSchema } from "../../models/http-error.schema.js";

const adminEmployeeGuard = [authenticate, authorize("ADMIN", "EMPLOYEE")];

export async function productRoutes(fastify: FastifyInstance) {
  const productController = new ProductController();

  fastify.post(
    "/create",
    {
      preHandler: adminEmployeeGuard,
      schema: {
        tags: ["Products"],
        summary: "Criar um produto",
        description:
          "Cria um produto a partir de multipart/form-data (campos do produto + arquivo de imagem JPEG/PNG 500x500, max 1MB). Apenas ADMIN e EMPLOYEE podem acessar.",
        security: [{ bearerAuth: [] }],
        consumes: ["multipart/form-data"],
        body: productCreateBodySchema,
        response: {
          201: z.null(),
          400: httpErrorSchema,
          401: httpErrorSchema,
          403: httpErrorSchema,
          404: httpErrorSchema,
          406: httpErrorSchema,
          409: httpErrorSchema,
          500: httpErrorSchema,
        },
      },
    },
    productController.create.bind(productController),
  );

  fastify.patch(
    "/:id",
    {
      preHandler: adminEmployeeGuard,
      schema: {
        tags: ["Products"],
        summary: "Atualizar um produto",
        description:
          "Atualiza os campos do produto (multipart/form-data). A imagem é opcional.",
        security: [{ bearerAuth: [] }],
        consumes: ["multipart/form-data"],
        params: productParamsSchema,
        body: productUpdateBodySchema,
        response: {
          200: z.object({
            product: productAdminSchema,
          }),
          400: httpErrorSchema,
          401: httpErrorSchema,
          404: httpErrorSchema,
          406: httpErrorSchema,
          409: httpErrorSchema,
          500: httpErrorSchema,
        },
      },
    },
    productController.update.bind(productController),
  );

  fastify.patch(
    "/:id/deactivate",
    {
      preHandler: adminEmployeeGuard,
      schema: {
        tags: ["Products"],
        summary: "Desativar um produto",
        description:
          "Marca um produto como inativo (soft delete). Apenas ADMIN e EMPLOYEE podem acessar.",
        security: [{ bearerAuth: [] }],
        params: productParamsSchema,
        response: {
          200: z.object({
            product: productAdminSchema,
          }),
          400: httpErrorSchema,
          401: httpErrorSchema,
          404: httpErrorSchema,
          500: httpErrorSchema,
        },
      },
    },
    productController.deactivate.bind(productController),
  );

  fastify.get(
    "/",
    {
      schema: {
        tags: ["Products"],
        summary: "Listar produtos ativos",
        description:
          "Lista produtos ativos com paginação (máximo de 20 por página).",
        querystring: productListQuerySchema,
        response: {
          200: productListResponseSchema,
          400: httpErrorSchema,
          500: httpErrorSchema,
        },
      },
    },
    productController.list.bind(productController),
  );

  fastify.get(
    "/:slug",
    {
      schema: {
        tags: ["Products"],
        summary: "Listar produtos de uma categoria pelo slug",
        description:
          "Lista produtos ativos de uma categoria (identificada pelo slug) com paginação (máximo de 20 por página).",
        params: productSlugParamsSchema,
        querystring: productListQuerySchema,
        response: {
          200: productListResponseSchema,
          400: httpErrorSchema,
          404: httpErrorSchema,
          500: httpErrorSchema,
        },
      },
    },
    productController.listBySlug.bind(productController),
  );
}
