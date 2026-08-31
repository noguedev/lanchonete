import type { FastifyInstance } from "fastify";
import { makeLoginController } from "./factories/login-user-controller.factory.js";
import { loginUserSchema } from "./auth.dtos.js";
import { httpErrorSchema } from "../../models/http-error.schema.js";
import { z } from "zod";

export async function authRoutes(fastify: FastifyInstance) {
  const loginUserController = makeLoginController(fastify);

  fastify.post(
    "/login",
    {
      schema: {
        tags: ["Auth"],
        summary: "Loga o usuário no sistema",
        description:
          "Faz login com o usuario devolvendo o acess token em json e refreshToken em cookies",
        body: loginUserSchema,
        response: {
          201: z.object({
            acessToken: z.string(),
          }),
          400: httpErrorSchema,
          401: httpErrorSchema,
          500: httpErrorSchema,
        },
      },
    },
    loginUserController.login.bind(loginUserController),
  );
}
