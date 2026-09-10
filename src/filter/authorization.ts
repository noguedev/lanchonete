import type { FastifyRequest } from "fastify";

import { ForbiddenException } from "../modules/auth/exceptions/forbidden.exception.js";
import type { UserRole } from "../models/index.js";

export function authorize(...allowedRoles: UserRole[]) {
  return async (request: FastifyRequest) => {
    const role = request.currentUser?.role;

    if (!role || !allowedRoles.includes(role)) {
      throw new ForbiddenException();
    }
  };
}
