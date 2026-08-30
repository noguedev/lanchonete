import type { FastifyInstance } from "fastify";
import { string, z } from "zod";

import { UserController } from "./user.controller.js";
import { createUserSchema } from "./user.dto.js";

export async function userRoutes(fastify: FastifyInstance) {
  const userController = new UserController();

  fastify.post(
    "/create",
    {
      schema: {
        tags: ["Users"],
        summary: "Criar um novo usuário",
        description:
          "Registra um novo usuário no sistema com nome, email, telefone (opcional) e senha.",

        body: createUserSchema,

        response: {
          201: z.null().describe("Usuário criado com sucesso"),

          400: z.object({
            message: z.string(),
            errors: z.array(
              z.object({
                field: z.string(),
                message: z.string(),
              }),
            ),
          }),

          401: z.object({
            statusCode: z.number(),
            error: z.string(),
            message: z.string(),
          })
        },
      },
    },

    userController.create.bind(userController),
  );
}
