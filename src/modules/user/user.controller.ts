import type { FastifyReply, FastifyRequest } from "fastify";

import { makeCreateUserService } from "./factories/create-user-service.factory.js";
import type { CreateUserDTO } from "./user.dto.js";

export class UserController {
  private readonly createUserService = makeCreateUserService();

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
