import { AddressNotFoundException } from "../exceptions/address-not-found.exception.js";
import type { UpdateAddressDTO } from "../address.dtos.js";
import type { AddressRepository } from "../address.repository.js";
import type { AddressInsert } from "../../../models/index.js";

export class UpdateAddressService {
  constructor(private readonly addressRepository: AddressRepository) {}

  async execute(userId: string, id: string, data: UpdateAddressDTO) {
    const address = await this.addressRepository.findByUserAndId(userId, id);

    if (!address) {
      throw new AddressNotFoundException();
    }

    if (data.isDefault === true) {
      await this.addressRepository.clearDefault(userId);
    }

    const payload: Partial<AddressInsert> = {};

    if (data.label !== undefined) payload.label = data.label;
    if (data.recipientName !== undefined) payload.recipientName = data.recipientName;
    if (data.phone !== undefined) payload.phone = data.phone;
    if (data.street !== undefined) payload.street = data.street;
    if (data.number !== undefined) payload.number = data.number;
    if (data.complement !== undefined) payload.complement = data.complement;
    if (data.neighborhood !== undefined) payload.neighborhood = data.neighborhood;
    if (data.city !== undefined) payload.city = data.city;
    if (data.state !== undefined) payload.state = data.state;
    if (data.postalCode !== undefined) payload.postalCode = data.postalCode;
    if (data.isDefault !== undefined) payload.isDefault = data.isDefault;

    return this.addressRepository.update(id, payload);
  }
}
