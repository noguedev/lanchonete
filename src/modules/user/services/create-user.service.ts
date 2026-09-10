import type { PasswordHash } from "../../auth/services/password-hash.service.js";
import { EmailAlreadyExistsException } from "../exceptions/email-already-exists.exception.js";
import type { CreateUserDTO } from "../user.dto.js";
import { UserRepository } from "../user.repository.js";

export class CreateUserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHash,
  ) {}

  async execute(data: CreateUserDTO) {
    const userExists = await this.userRepository.findByEmail(data.email);

    if (userExists.length > 0) {
      throw new EmailAlreadyExistsException();
    }

    const passwordHash = await this.passwordHasher.hash(data.password);

    const user = await this.userRepository.createUser({
      name: data.name,
      email: data.email,
      phone: data.phone,
      passwordHash,
    });

    return user;
  }
}
