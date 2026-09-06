import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { AddressController } from "./address.controller.js";
import {
  createAddressSchema,
  updateAddressSchema,
  addressParamsSchema,
} from "./address.dtos.js";
import { authenticate } from "../../filter/authentication.js";
import { httpErrorSchema } from "../../models/http-error.schema.js";

const addressResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  label: z.string().nullable(),
  recipientName: z.string().nullable(),
  phone: z.string().nullable(),
  street: z.string(),
  number: z.string(),
  complement: z.string().nullable(),
  neighborhood: z.string().nullable(),
  city: z.string(),
  state: z.string(),
  postalCode: z.string(),
  isDefault: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
});

const authGuard = [authenticate];

export async function addressRoutes(fastify: FastifyInstance) {
  const addressController = new AddressController();

  fastify.post(
    "/",
    {
      preHandler: authGuard,
      schema: {
        tags: ["Addresses"],
        summary: "Cadastrar um endereço",
        description:
          "Cadastra um novo endereço para o usuário autenticado. Um usuário pode ter vários endereços.",
        security: [{ bearerAuth: [] }],
        body: createAddressSchema,
        response: {
          201: z.null(),
          400: httpErrorSchema,
          401: httpErrorSchema,
          500: httpErrorSchema,
        },
      },
    },
    addressController.create.bind(addressController),
  );

  fastify.get(
    "/",
    {
      preHandler: authGuard,
      schema: {
        tags: ["Addresses"],
        summary: "Listar endereços do usuário",
        description: "Retorna todos os endereços cadastrados do usuário autenticado.",
        security: [{ bearerAuth: [] }],
        response: {
          200: z.object({
            addresses: z.array(addressResponseSchema),
          }),
          401: httpErrorSchema,
          500: httpErrorSchema,
        },
      },
    },
    addressController.list.bind(addressController),
  );

  fastify.patch(
    "/:id",
    {
      preHandler: authGuard,
      schema: {
        tags: ["Addresses"],
        summary: "Atualizar um endereço",
        description: "Atualiza um endereço do usuário autenticado.",
        security: [{ bearerAuth: [] }],
        params: addressParamsSchema,
        body: updateAddressSchema,
        response: {
          200: z.object({
            address: addressResponseSchema,
          }),
          400: httpErrorSchema,
          401: httpErrorSchema,
          404: httpErrorSchema,
          500: httpErrorSchema,
        },
      },
    },
    addressController.update.bind(addressController),
  );

  fastify.delete(
    "/:id",
    {
      preHandler: authGuard,
      schema: {
        tags: ["Addresses"],
        summary: "Remover um endereço",
        description: "Remove um endereço do usuário autenticado.",
        security: [{ bearerAuth: [] }],
        params: addressParamsSchema,
        response: {
          200: z.object({
            message: z.string(),
          }),
          400: httpErrorSchema,
          401: httpErrorSchema,
          404: httpErrorSchema,
          500: httpErrorSchema,
        },
      },
    },
    addressController.remove.bind(addressController),
  );
}
