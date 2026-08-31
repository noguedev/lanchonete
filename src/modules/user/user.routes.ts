import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { UserController } from "./user.controller.js";
import { createUserSchema } from "./user.dto.js";
import { httpErrorSchema } from "../../models/http-error.schema.js";

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

          400: httpErrorSchema,

          401: httpErrorSchema,

          500: httpErrorSchema,
        },
      },
    },

    userController.create.bind(userController),
  );
}
