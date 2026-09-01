import { describe, it, expect, vi, beforeEach } from "vitest";

import { LoginUserService } from "./login-user.service.js";
import { EmailOrPasswordException } from "../../user/exceptions/email-or-password.exception.js";
import type { UserRepository } from "../../user/user.repository.js";
import type { JwtService } from "./jwt.service.js";
import type { PasswordHash } from "./password-hash.service.js";
import type { RefreshTokenService } from "./refresh-token.service.js";
import type { User } from "../../../models/index.js";

const fakeUser = (): User => ({
  id: "u1",
  name: "João",
  email: "joao@x.com",
  phone: null,
  passwordHash: "$argon2id$hash",
  role: "CUSTOMER",
  isActive: true,
  isBanned: false,
  bannedAt: null,
  bannedBy: null,
  createdAt: new Date(),
  updatedAt: null,
});

const validCredentials = {
  email: "joao@x.com",
  password: "senha-super-secreta",
};

describe("LoginUserService", () => {
  let findByEmail: ReturnType<typeof vi.fn>;
  let generateAccessToken: ReturnType<typeof vi.fn>;
  let generateRefreshToken: ReturnType<typeof vi.fn>;
  let validade: ReturnType<typeof vi.fn>;
  let issueToken: ReturnType<typeof vi.fn>;
  let refresh: ReturnType<typeof vi.fn>;
  let service: LoginUserService;

  beforeEach(() => {
    findByEmail = vi.fn();
    generateAccessToken = vi.fn().mockResolvedValue("access-token");
    generateRefreshToken = vi.fn().mockReturnValue("raw-refresh");
    validade = vi.fn();
    issueToken = vi.fn().mockResolvedValue("raw-refresh");
    refresh = vi.fn();

    const userRepository = {
      findByEmail,
      findById: vi.fn(),
      createUser: vi.fn(),
    } as unknown as UserRepository;

    const jwtService = {
      generateAccessToken,
      generateRefreshToken,
    } as unknown as JwtService;

    const passwordHasher = {
      hash: vi.fn(),
      validade,
    } as unknown as PasswordHash;

    const refreshTokenService = {
      issueToken,
      refresh,
    } as unknown as RefreshTokenService;

    service = new LoginUserService(
      userRepository,
      jwtService,
      passwordHasher,
      refreshTokenService,
    );
  });

  it("throws EmailOrPasswordException when the email does not exist", async () => {
    findByEmail.mockResolvedValue([]);

    await expect(service.execute(validCredentials)).rejects.toBeInstanceOf(
      EmailOrPasswordException,
    );
  });

  it("throws EmailOrPasswordException when the password is wrong", async () => {
    findByEmail.mockResolvedValue([fakeUser()]);
    validade.mockResolvedValue(false);

    await expect(service.execute(validCredentials)).rejects.toBeInstanceOf(
      EmailOrPasswordException,
    );
  });

  it("does not issue tokens when credentials are invalid", async () => {
    findByEmail.mockResolvedValue([]);

    await expect(service.execute(validCredentials)).rejects.toThrow();
    expect(generateAccessToken).not.toHaveBeenCalled();
    expect(issueToken).not.toHaveBeenCalled();
  });

  it("returns the token pair and issues the refresh token on success", async () => {
    findByEmail.mockResolvedValue([fakeUser()]);
    validade.mockResolvedValue(true);

    const result = await service.execute(validCredentials, {
      ipAddress: "127.0.0.1",
    });

    expect(result).toEqual({ JwtToken: "access-token", TokenRefresh: "raw-refresh" });
    expect(generateAccessToken).toHaveBeenCalledWith({ id: "u1", role: "CUSTOMER" });
    expect(issueToken).toHaveBeenCalledWith("u1", { ipAddress: "127.0.0.1" });
  });

  it("forwards the context (userAgent/ip) to token issuance", async () => {
    findByEmail.mockResolvedValue([fakeUser()]);
    validade.mockResolvedValue(true);

    await service.execute(validCredentials, {
      userAgent: "vitest/1.0",
      ipAddress: "127.0.0.1",
    });

    expect(issueToken).toHaveBeenCalledWith("u1", {
      userAgent: "vitest/1.0",
      ipAddress: "127.0.0.1",
    });
  });

  it("uses the user role in the access token", async () => {
    findByEmail.mockResolvedValue([
      { ...fakeUser(), role: "ADMIN" as const },
    ]);
    validade.mockResolvedValue(true);

    await service.execute(validCredentials);

    expect(generateAccessToken).toHaveBeenCalledWith({ id: "u1", role: "ADMIN" });
  });
});
