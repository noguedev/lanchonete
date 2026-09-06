import type { AddressRepository } from "../address.repository.js";

export class ListAddressesService {
  constructor(private readonly addressRepository: AddressRepository) {}

  execute(userId: string) {
    return this.addressRepository.findByUser(userId);
  }
}
