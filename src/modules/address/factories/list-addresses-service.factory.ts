import { AddressRepository } from "../address.repository.js";
import { ListAddressesService } from "../services/list-addresses.service.js";

export function makeListAddressesService() {
  const addressRepository = new AddressRepository();

  return new ListAddressesService(addressRepository);
}
