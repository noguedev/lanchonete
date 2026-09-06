import { AddressNotFoundException } from "../exceptions/address-not-found.exception.js";
import type { AddressRepository } from "../address.repository.js";

export class DeleteAddressService {
  constructor(private readonly addressRepository: AddressRepository) {}

  async execute(userId: string, id: string) {
    const address = await this.addressRepository.findByUserAndId(userId, id);

    if (!address) {
      throw new AddressNotFoundException();
    }

    await this.addressRepository.delete(id);
  }
}
