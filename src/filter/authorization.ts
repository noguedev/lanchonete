import type { FastifyRequest } from "fastify";

import { ForbiddenException } from "../modules/auth/exceptions/forbidden.exception.js";
import type { UserRole } from "../models/index.js";

export function authorize(...allowedRoles: UserRole[]) {
  return async (request: FastifyRequest) => {
    const user = request.user;

    if (!user || !allowedRoles.includes(user.role)) {
      throw new ForbiddenException();
    }
  };
}
