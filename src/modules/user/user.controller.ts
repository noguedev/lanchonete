import type { FastifyReply, FastifyRequest } from "fastify";

import { makeUserService } from "./factories/user.factory.js";
import type { CreateUserDTO } from "./user.dto.js";

export class UserController {
  private readonly createUserService = makeUserService();

  async create(
    request: FastifyRequest<{
      Body: CreateUserDTO;
    }>,
    reply: FastifyReply,
  ) {
    await this.createUserService.execute(request.body);

    return reply.status(201).send();
  }
}
