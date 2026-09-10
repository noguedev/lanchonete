import type { FastifyInstance } from "fastify";

import { UserRepository } from "../../user/user.repository.js";
import { RefreshTokenRepository } from "../refresh-token.repository.js";
import { JwtService } from "../services/jwt.service.js";
import { RefreshTokenService } from "../services/refresh-token.service.js";

export function makeRefreshTokenService(fastify: FastifyInstance) {
  const userRepository = new UserRepository();

  const refreshTokenRepository = new RefreshTokenRepository();

  const jwtService = new JwtService(fastify);

  return new RefreshTokenService(
    refreshTokenRepository,
    userRepository,
    jwtService,
  );
}
