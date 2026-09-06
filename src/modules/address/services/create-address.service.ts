import type { CreateAddressDTO } from "../address.dtos.js";
import type { AddressRepository } from "../address.repository.js";

export class CreateAddressService {
  constructor(private readonly addressRepository: AddressRepository) {}

  async execute(userId: string, data: CreateAddressDTO) {
    if (data.isDefault === true) {
      await this.addressRepository.clearDefault(userId);
    }

    return this.addressRepository.create({
      userId,
      label: data.label ?? null,
      recipientName: data.recipientName ?? null,
      phone: data.phone ?? null,
      street: data.street,
      number: data.number,
      complement: data.complement ?? null,
      neighborhood: data.neighborhood ?? null,
      city: data.city,
      state: data.state,
      postalCode: data.postalCode,
      isDefault: data.isDefault ?? false,
    });
  }
}
