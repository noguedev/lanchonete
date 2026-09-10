import type { FastifyInstance } from "fastify";
import { makeAuthController } from "./factories/auth-controller.factory.js";
import { loginUserSchema } from "./auth.dtos.js";
import { httpErrorSchema } from "../../models/http-error.schema.js";
import { authenticate } from "../../filter/authentication.js";
import { z } from "zod";

const currentUserSchema = z.object({
  name: z.string(),
  email: z.string(),
  role: z.enum(["ADMIN", "EMPLOYEE", "CUSTOMER"]),
});

export async function authRoutes(fastify: FastifyInstance) {
  const authController = makeAuthController(fastify);

  fastify.post(
    "/login",
    {
      config: {
        rateLimit: { max: 5, timeWindow: "1 minute" },
      },
      schema: {
        tags: ["Auth"],
        summary: "Loga o usuário no sistema",
        description:
          "Faz login com o usuario devolvendo o access token em json e refreshToken em cookies",
        body: loginUserSchema,
        response: {
          200: z.object({
            accessToken: z.string(),
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
      config: {
        rateLimit: { max: 5, timeWindow: "1 minute" },
      },
      schema: {
        tags: ["Auth"],
        summary: "Renova a sessão do usuário",
        description:
          "Valida o refresh token do cookie e devolve um novo access token em json e um novo refresh token em cookie.",
        response: {
          200: z.object({
            accessToken: z.string(),
          }),
          401: httpErrorSchema,
          500: httpErrorSchema,
        },
      },
    },
    authController.refresh.bind(authController),
  );

  fastify.get(
    "/me",
    {
      preHandler: [authenticate],
      schema: {
        tags: ["Auth"],
        summary: "Retorna o usuário autenticado",
        description:
          "Retorna o nome, email e role do usuário autenticado a partir do access token.",
        security: [{ bearerAuth: [] }],
        response: {
          200: z.object({
            user: currentUserSchema,
          }),
          401: httpErrorSchema,
          500: httpErrorSchema,
        },
      },
    },
    authController.me.bind(authController),
  );

  fastify.post(
    "/logout",
    {
      schema: {
        tags: ["Auth"],
        summary: "Encerra a sessão do usuário",
        description:
          "Revoga o refresh token do cookie e limpa o cookie de sessão.",
        response: {
          200: z.object({
            message: z.string(),
          }),
          500: httpErrorSchema,
        },
      },
    },
    authController.logout.bind(authController),
  );
}
