import "fastify";

import type { User } from "../models/index.js";

declare module "fastify" {
  interface FastifyRequest {
    currentUser?: User;
  }
}
