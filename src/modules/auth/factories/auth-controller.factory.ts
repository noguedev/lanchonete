import type { FastifyInstance } from "fastify";

import { AuthController } from "../auth.controller.js";
import { makeRefreshTokenService } from "./refresh-token-service.factory.js";
import { makeUserLoginService } from "./login-user-service.factory.js";

export function makeAuthController(fastify: FastifyInstance) {
  const loginUserService = makeUserLoginService(fastify);
  const refreshTokenService = makeRefreshTokenService(fastify);

  return new AuthController(loginUserService, refreshTokenService);
}
