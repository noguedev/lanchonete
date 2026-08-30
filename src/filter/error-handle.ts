import type {
  FastifyError,
  FastifyReply,
  FastifyRequest,
} from "fastify";

import { AppError } from "../models/exception-base.js";

export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      message: error.message,
    });
  }

  request.log.error(error);

  return reply.status(500).send({
    message: "Erro interno do servidor.",
    code: "INTERNAL_SERVER_ERROR",
  });
}