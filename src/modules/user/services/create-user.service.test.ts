import { describe, it, expect, vi, beforeEach } from "vitest";

import { CreateUserService } from "./create-user.service.js";
import { EmailOrPasswordException } from "../exceptions/email-or-password.exception.js";
import type { UserRepository } from "../user.repository.js";
import type { PasswordHash } from "../../auth/services/password-hash.service.js";
import type { User } from "../../../models/index.js";

const fakeUser = (): User => ({
  id: "u1",
  name: "João",
  email: "joao@x.com",
  phone: "11999999999",
  passwordHash: "$argon2id$hash",
  role: "CUSTOMER",
  isActive: true,
  isBanned: false,
  bannedAt: null,
  bannedBy: null,
  createdAt: new Date(),
  updatedAt: null,
});

const validData = {
  name: "João",
  email: "joao@x.com",
  phone: "11999999999",
  password: "senha-super-secreta",
};

describe("CreateUserService", () => {
  let findByEmail: ReturnType<typeof vi.fn>;
  let createUser: ReturnType<typeof vi.fn>;
  let hash: ReturnType<typeof vi.fn>;
  let service: CreateUserService;

  beforeEach(() => {
    findByEmail = vi.fn();
    createUser = vi.fn();
    hash = vi.fn();

    const userRepository = {
      findByEmail,
      createUser,
      findById: vi.fn(),
    } as unknown as UserRepository;

    const passwordHasher = {
      hash,
      validade: vi.fn(),
    } as unknown as PasswordHash;

    service = new CreateUserService(userRepository, passwordHasher);
  });

  it("creates the user with the hashed password", async () => {
    findByEmail.mockResolvedValue([]);
    hash.mockResolvedValue("hash-argon2");
    const createdUser = fakeUser();
    createUser.mockResolvedValue(createdUser);

    const result = await service.execute(validData);

    expect(hash).toHaveBeenCalledWith(validData.password);
    expect(createUser).toHaveBeenCalledWith({
      name: validData.name,
      email: validData.email,
      phone: validData.phone,
      passwordHash: "hash-argon2",
    });
    expect(result).toEqual(createdUser);
  });

  it("throws EmailOrPasswordException when the email already exists", async () => {
    findByEmail.mockResolvedValue([fakeUser()]);

    await expect(service.execute(validData)).rejects.toBeInstanceOf(
      EmailOrPasswordException,
    );
  });

  it("does not create a user when the email is duplicated", async () => {
    findByEmail.mockResolvedValue([fakeUser()]);

    await expect(service.execute(validData)).rejects.toThrow();
    expect(createUser).not.toHaveBeenCalled();
  });

  it("converts an empty/missing phone to undefined without breaking", async () => {
    findByEmail.mockResolvedValue([]);
    hash.mockResolvedValue("hash-argon2");
    createUser.mockResolvedValue(fakeUser());

    const data = { ...validData, phone: undefined };

    await service.execute(data);
    expect(createUser).toHaveBeenCalledWith(
      expect.objectContaining({ phone: undefined }),
    );
  });
});
