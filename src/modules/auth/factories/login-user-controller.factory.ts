import type { FastifyInstance } from "fastify";

import { AuthController } from "../auth.controller.js";
import { makeUserLoginService } from "./login-user-service.factory.js";

export function makeLoginController(fastify: FastifyInstance) {
  const loginService = makeUserLoginService(fastify);
  const authController = new AuthController(loginService);

  return authController;
}
