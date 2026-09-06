import { AddressRepository } from "../address.repository.js";
import { UpdateAddressService } from "../services/update-address.service.js";

export function makeUpdateAddressService() {
  const addressRepository = new AddressRepository();

  return new UpdateAddressService(addressRepository);
}
