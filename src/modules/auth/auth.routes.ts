import type { FastifyInstance } from "fastify";
import { makeAuthController } from "./factories/auth-controller.factory.js";
import { loginUserSchema } from "./auth.dtos.js";
import { httpErrorSchema } from "../../models/http-error.schema.js";
import { z } from "zod";

export async function authRoutes(fastify: FastifyInstance) {
  const authController = makeAuthController(fastify);

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
    authController.login.bind(authController),
  );

  fastify.post(
    "/refresh",
    {
      schema: {
        tags: ["Auth"],
        summary: "Renova a sessão do usuário",
        description:
          "Valida o refresh token do cookie e devolve um novo acess token em json e um novo refresh token em cookie.",
        response: {
          200: z.object({
            acessToken: z.string(),
          }),
          401: httpErrorSchema,
          500: httpErrorSchema,
        },
      },
    },
    authController.refresh.bind(authController),
  );
}
