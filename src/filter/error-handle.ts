import type {
  FastifyError,
  FastifyReply,
  FastifyRequest,
} from "fastify";

import { AppError } from "../models/exception-base.js";

const STATUS_MESSAGES: Record<number, string> = {
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  409: "Conflict",
  422: "Unprocessable Entity",
  500: "Internal Server Error",
};

function statusMessage(statusCode: number) {
  return STATUS_MESSAGES[statusCode] ?? "Error";
}

export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      statusCode: error.statusCode,
      error: statusMessage(error.statusCode),
      message: error.message,
    });
  }

  if (error.validation) {
    return reply.status(400).send({
      statusCode: 400,
      error: statusMessage(400),
      message: error.message,
      errors: error.validation.map((issue) => ({
        field: issue.instancePath.replace(/^\//, "") || "body",
        message: issue.message,
      })),
    });
  }

  if (typeof error.statusCode === "number" && error.statusCode < 500) {
    const statusCode = error.statusCode;
    return reply.status(statusCode).send({
      statusCode,
      error: statusMessage(statusCode),
      message: error.message,
    });
  }

  request.log.error(error);

  return reply.status(500).send({
    statusCode: 500,
    error: statusMessage(500),
    message: "Erro interno do servidor.",
    code: "INTERNAL_SERVER_ERROR",
  });
}
