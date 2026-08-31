import type { FastifyInstance } from "fastify";

import { UserRepository } from "../../user/user.repository.js";
import { RefreshTokenRepository } from "../refresh-token.repository.js";
import { JwtService } from "../services/jwt.service.js";
import { LoginUserService } from "../services/login-user.service.js";
import { PasswordHash } from "../services/password-hash.service.js";

export function makeUserLoginService(fastify: FastifyInstance) {
  const userRepository = new UserRepository();

  const refreshTokenRepository = new RefreshTokenRepository();

  const passwordHasher = new PasswordHash();

  const jwtService = new JwtService(fastify);

  return new LoginUserService(
    userRepository,
    jwtService,
    passwordHasher,
    refreshTokenRepository,
  );
}
