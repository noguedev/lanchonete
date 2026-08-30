import { PasswordHash } from "../../auth/password.hash.service.js";
import { UserRepository } from "../user.repository.js"
import { CreateUserService } from "../services/create.user.service.js";

export function makeUserService(){
    const userRepository = new UserRepository()
    const passwordHasher = new PasswordHash()

    return new CreateUserService(userRepository, passwordHasher);
}