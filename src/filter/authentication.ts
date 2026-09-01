import type { FastifyRequest } from "fastify";

import { UnauthorizedException } from "../modules/auth/exceptions/unauthorized.exception.js";

export async function authenticate(request: FastifyRequest) {
  try {
    await request.jwtVerify();
  } catch {
    throw new UnauthorizedException();
  }
}
