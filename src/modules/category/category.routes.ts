import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { CategoryController } from "./category.controller.js";
import {
  createCategorySchema,
  updateCategorySchema,
  categoryParamsSchema,
} from "./category.dtos.js";
import { authenticate } from "../../filter/authentication.js";
import { authorize } from "../../filter/authorization.js";
import { httpErrorSchema } from "../../models/http-error.schema.js";

const categoryResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
});

const adminEmployeeGuard = [authenticate, authorize("ADMIN", "EMPLOYEE")];

export async function categoryRoutes(fastify: FastifyInstance) {
  const categoryController = new CategoryController();

  fastify.post(
    "/",
    {
      preHandler: adminEmployeeGuard,
        schema: {
        tags: ["Categories"],
        summary: "Criar uma categoria",
        description:
          "Cria uma nova categoria de produtos. Apenas ADMIN e EMPLOYEE podem acessar.",
        security: [{ bearerAuth: [] }],
        body: createCategorySchema,
        response: {
          201: z.object({
            category: categoryResponseSchema,
          }),
          400: httpErrorSchema,
          401: httpErrorSchema,
          403: httpErrorSchema,
          409: httpErrorSchema,
          500: httpErrorSchema,
        },
      },
    },
    categoryController.create.bind(categoryController),
  );

  fastify.patch(
    "/:id",
    {
      preHandler: adminEmployeeGuard,
      schema: {
        tags: ["Categories"],
        summary: "Alterar o nome de uma categoria",
        description:
          "Atualiza o nome (e, opcionalmente, a descrição) de uma categoria.",
        security: [{ bearerAuth: [] }],
        params: categoryParamsSchema,
        body: updateCategorySchema,
        response: {
          200: z.object({
            category: categoryResponseSchema,
          }),
          400: httpErrorSchema,
          401: httpErrorSchema,
          404: httpErrorSchema,
          500: httpErrorSchema,
        },
      },
    },
    categoryController.update.bind(categoryController),
  );

  fastify.patch(
    "/:id/deactivate",
    {
      preHandler: adminEmployeeGuard,
      schema: {
        tags: ["Categories"],
        summary: "Desativar uma categoria",
        description:
          "Marca uma categoria como inativa (soft delete). Apenas ADMIN e EMPLOYEE podem acessar.",
        security: [{ bearerAuth: [] }],
        params: categoryParamsSchema,
        response: {
          200: z.object({
            category: categoryResponseSchema,
          }),
          400: httpErrorSchema,
          401: httpErrorSchema,
          404: httpErrorSchema,
          500: httpErrorSchema,
        },
      },
    },
    categoryController.deactivate.bind(categoryController),
  );

  fastify.get(
    "/",
    {
      schema: {
        tags: ["Categories"],
        summary: "Listar categorias ativas",
        description: "Retorna a lista de categorias ativas.",
        response: {
          200: z.object({
            categories: z.array(categoryResponseSchema),
          }),
          500: httpErrorSchema,
        },
      },
    },
    categoryController.list.bind(categoryController),
  );
}
