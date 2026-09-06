import type { FastifyReply, FastifyRequest } from "fastify";

import { makeCreateAddressService } from "./factories/create-address-service.factory.js";
import { makeUpdateAddressService } from "./factories/update-address-service.factory.js";
import { makeDeleteAddressService } from "./factories/delete-address-service.factory.js";
import { makeListAddressesService } from "./factories/list-addresses-service.factory.js";
import { AddressNotFoundException } from "./exceptions/address-not-found.exception.js";
import type {
  CreateAddressDTO,
  UpdateAddressDTO,
  AddressParams,
} from "./address.dtos.js";
import type { Address } from "../../models/index.js";
import type { AddressResponse } from "./types/index.js";

function toAddressResponse(address: Address): AddressResponse {
  return {
    id: address.id,
    userId: address.userId,
    label: address.label,
    recipientName: address.recipientName,
    phone: address.phone,
    street: address.street,
    number: address.number,
    complement: address.complement,
    neighborhood: address.neighborhood,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    isDefault: address.isDefault,
    createdAt: address.createdAt.toISOString(),
    updatedAt: address.updatedAt ? address.updatedAt.toISOString() : null,
  };
}

function requireAddress(address: Address | undefined): Address {
  if (!address) {
    throw new AddressNotFoundException();
  }

  return address;
}

export class AddressController {
  private readonly createAddressService = makeCreateAddressService();
  private readonly updateAddressService = makeUpdateAddressService();
  private readonly deleteAddressService = makeDeleteAddressService();
  private readonly listAddressesService = makeListAddressesService();

  async create(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user.sub;

    await this.createAddressService.execute(
      userId,
      request.body as CreateAddressDTO,
    );

    return reply.status(201).send();
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user.sub;

    const addresses = await this.listAddressesService.execute(userId);

    return reply
      .status(200)
      .send({ addresses: addresses.map(toAddressResponse) });
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user.sub;
    const id = (request.params as AddressParams).id;

    const address = await this.updateAddressService.execute(
      userId,
      id,
      request.body as UpdateAddressDTO,
    );

    return reply
      .status(200)
      .send({ address: toAddressResponse(requireAddress(address)) });
  }

  async remove(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user.sub;
    const id = (request.params as AddressParams).id;

    await this.deleteAddressService.execute(userId, id);

    return reply.status(200).send({ message: "Endereço removido" });
  }
}
