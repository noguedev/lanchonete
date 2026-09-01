import "@fastify/jwt";

import type { UserRole } from "../models/index.js";

export type JwtPayload = {
  sub: string;
  role: UserRole;
  iat?: number;
  exp?: number;
};

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: JwtPayload;
    user: JwtPayload;
  }
}
