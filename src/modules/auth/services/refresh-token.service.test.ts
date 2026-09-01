import { describe, it, expect, vi, beforeEach } from "vitest";

import { RefreshTokenService } from "./refresh-token.service.js";
import { InvalidRefreshTokenException } from "../exceptions/invalid-refresh-token.exception.js";
import type { RefreshTokenRepository } from "../refresh-token.repository.js";
import type { UserRepository } from "../../user/user.repository.js";
import type { JwtService } from "./jwt.service.js";
import type { PasswordHash } from "./password-hash.service.js";
import type { RefreshToken, User } from "../../../models/index.js";

const fakeToken = (overrides: Partial<RefreshToken> = {}): RefreshToken => ({
  id: "rt1",
  userId: "u1",
  tokenHash: "hash1",
  expiresAt: new Date(Date.now() + 3_600_000),
  revokedAt: null,
  createdAt: new Date(),
  userAgent: null,
  ipAddress: null,
  ...overrides,
});

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

describe("RefreshTokenService", () => {
  let create: ReturnType<typeof vi.fn>;
  let findActive: ReturnType<typeof vi.fn>;
  let findById: ReturnType<typeof vi.fn>;
  let revoke: ReturnType<typeof vi.fn>;
  let generateAccessToken: ReturnType<typeof vi.fn>;
  let generateRefreshToken: ReturnType<typeof vi.fn>;
  let hash: ReturnType<typeof vi.fn>;
  let validade: ReturnType<typeof vi.fn>;
  let service: RefreshTokenService;

  beforeEach(() => {
    create = vi.fn().mockResolvedValue(fakeToken());
    findActive = vi.fn();
    findById = vi.fn();
    revoke = vi.fn().mockResolvedValue(undefined);
    generateAccessToken = vi.fn().mockResolvedValue("new-access");
    generateRefreshToken = vi.fn().mockReturnValue("new-raw");
    hash = vi.fn().mockResolvedValue("hash-argon2");
    validade = vi.fn();

    const refreshTokenRepository = {
      create,
      findByHash: vi.fn(),
      findActive,
      findActiveByUserId: vi.fn(),
      revoke,
    } as unknown as RefreshTokenRepository;

    const userRepository = {
      findByEmail: vi.fn(),
      findById,
      createUser: vi.fn(),
    } as unknown as UserRepository;

    const jwtService = { generateAccessToken, generateRefreshToken } as unknown as JwtService;

    const passwordHasher = { hash, validade } as unknown as PasswordHash;

    service = new RefreshTokenService(
      refreshTokenRepository,
      userRepository,
      jwtService,
      passwordHasher,
    );
  });

  describe("issueToken", () => {
    it("persists only the hash (never the raw value)", async () => {
      const result = await service.issueToken("u1", {
        userAgent: "vitest/1.0",
        ipAddress: "127.0.0.1",
      });

      expect(result).toBe("new-raw");
      expect(hash).toHaveBeenCalledWith("new-raw");
      expect(create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "u1",
          tokenHash: "hash-argon2",
          userAgent: "vitest/1.0",
          ipAddress: "127.0.0.1",
          expiresAt: expect.any(Date),
        }),
      );
    });

    it("sets an expiresAt in the future", async () => {
      await service.issueToken("u1");

      const arg = create.mock.calls[0]?.[0] as { expiresAt: Date } | undefined;
      expect(arg?.expiresAt).toBeInstanceOf(Date);
      expect(arg!.expiresAt.getTime()).toBeGreaterThan(Date.now() - 1000);
    });
  });

  describe("refresh", () => {
    it("throws InvalidRefreshTokenException when there is no token", async () => {
      await expect(service.refresh(undefined)).rejects.toBeInstanceOf(
        InvalidRefreshTokenException,
      );
    });

    it("throws InvalidRefreshTokenException when there are no active tokens", async () => {
      findActive.mockResolvedValue([]);

      await expect(service.refresh("raw")).rejects.toBeInstanceOf(
        InvalidRefreshTokenException,
      );
    });

    it("throws InvalidRefreshTokenException when no token matches", async () => {
      findActive.mockResolvedValue([fakeToken()]);
      validade.mockResolvedValue(false);

      await expect(service.refresh("raw")).rejects.toBeInstanceOf(
        InvalidRefreshTokenException,
      );
    });

    it("throws InvalidRefreshTokenException when the user does not exist", async () => {
      findActive.mockResolvedValue([fakeToken()]);
      validade.mockResolvedValue(true);
      findById.mockResolvedValue(undefined);

      await expect(service.refresh("raw")).rejects.toBeInstanceOf(
        InvalidRefreshTokenException,
      );
    });

    it("revokes the old token and issues a new pair on success", async () => {
      findActive.mockResolvedValue([fakeToken({ id: "rt1" })]);
      validade.mockResolvedValue(true);
      findById.mockResolvedValue(fakeUser());

      const result = await service.refresh("raw", { ipAddress: "127.0.0.1" });

      expect(revoke).toHaveBeenCalledWith("rt1");
      expect(generateAccessToken).toHaveBeenCalledWith({ id: "u1", role: "CUSTOMER" });
      expect(hash).toHaveBeenCalledWith("new-raw");
      expect(create).toHaveBeenCalled();
      expect(result).toEqual({ JwtToken: "new-access", TokenRefresh: "new-raw" });
    });

    it("finds the correct token among several active tokens", async () => {
      findActive.mockResolvedValue([
        fakeToken({ id: "rt1", tokenHash: "hash1" }),
        fakeToken({ id: "rt2", tokenHash: "hash2" }),
      ]);
      validade.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
      findById.mockResolvedValue(fakeUser());

      await service.refresh("raw");

      expect(revoke).toHaveBeenCalledWith("rt2");
    });
  });
});
