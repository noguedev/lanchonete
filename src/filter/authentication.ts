import type { FastifyRequest } from "fastify";

import { AccountDisabledException } from "../modules/auth/exceptions/account-disabled.exception.js";
import { UnauthorizedException } from "../modules/auth/exceptions/unauthorized.exception.js";
import { UserRepository } from "../modules/user/user.repository.js";

export async function authenticate(request: FastifyRequest) {
  try {
    await request.jwtVerify();
  } catch {
    throw new UnauthorizedException();
  }

  const userRepository = new UserRepository();
  const user = await userRepository.findById(request.user.sub);

  if (!user) {
    throw new UnauthorizedException();
  }

  if (!user.isActive || user.isBanned) {
    throw new AccountDisabledException();
  }

  request.currentUser = user;
}
