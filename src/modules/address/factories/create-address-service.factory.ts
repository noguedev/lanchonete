import { AddressRepository } from "../address.repository.js";
import { CreateAddressService } from "../services/create-address.service.js";

export function makeCreateAddressService() {
  const addressRepository = new AddressRepository();

  return new CreateAddressService(addressRepository);
}
