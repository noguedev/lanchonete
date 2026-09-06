import { AddressRepository } from "../address.repository.js";
import { DeleteAddressService } from "../services/delete-address.service.js";

export function makeDeleteAddressService() {
  const addressRepository = new AddressRepository();

  return new DeleteAddressService(addressRepository);
}
