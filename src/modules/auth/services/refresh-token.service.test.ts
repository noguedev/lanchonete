import { describe, it, expect, vi, beforeEach } from "vitest";

import { RefreshTokenService } from "./refresh-token.service.js";
import { InvalidRefreshTokenException } from "../exceptions/invalid-refresh-token.exception.js";
import { AccountDisabledException } from "../exceptions/account-disabled.exception.js";
import { hashRefreshToken } from "../util/hash-refresh-token.js";
import type { RefreshTokenRepository } from "../refresh-token.repository.js";
import type { UserRepository } from "../../user/user.repository.js";
import type { JwtService } from "./jwt.service.js";
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
  let findActiveByHash: ReturnType<typeof vi.fn>;
  let findById: ReturnType<typeof vi.fn>;
  let revoke: ReturnType<typeof vi.fn>;
  let generateAccessToken: ReturnType<typeof vi.fn>;
  let generateRefreshToken: ReturnType<typeof vi.fn>;
  let service: RefreshTokenService;

  beforeEach(() => {
    create = vi.fn().mockResolvedValue(fakeToken());
    findActiveByHash = vi.fn();
    findById = vi.fn();
    revoke = vi.fn().mockResolvedValue(undefined);
    generateAccessToken = vi.fn().mockResolvedValue("new-access");
    generateRefreshToken = vi.fn().mockReturnValue("new-raw");

    const refreshTokenRepository = {
      create,
      findActiveByHash,
      revoke,
    } as unknown as RefreshTokenRepository;

    const userRepository = {
      findByEmail: vi.fn(),
      findById,
      createUser: vi.fn(),
    } as unknown as UserRepository;

    const jwtService = {
      generateAccessToken,
      generateRefreshToken,
    } as unknown as JwtService;

    service = new RefreshTokenService(
      refreshTokenRepository,
      userRepository,
      jwtService,
    );
  });

  describe("issueToken", () => {
    it("persists only the deterministic hash (never the raw value)", async () => {
      const result = await service.issueToken("u1", {
        userAgent: "vitest/1.0",
        ipAddress: "127.0.0.1",
      });

      expect(result).toBe("new-raw");
      expect(create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "u1",
          tokenHash: hashRefreshToken("new-raw"),
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

    it("looks the token up by its hash and throws when none is active", async () => {
      findActiveByHash.mockResolvedValue(undefined);

      await expect(service.refresh("raw")).rejects.toBeInstanceOf(
        InvalidRefreshTokenException,
      );
      expect(findActiveByHash).toHaveBeenCalledWith(hashRefreshToken("raw"));
    });

    it("throws InvalidRefreshTokenException when the user does not exist", async () => {
      findActiveByHash.mockResolvedValue(fakeToken());
      findById.mockResolvedValue(undefined);

      await expect(service.refresh("raw")).rejects.toBeInstanceOf(
        InvalidRefreshTokenException,
      );
    });

    it("revokes the old token and issues a new pair on success", async () => {
      findActiveByHash.mockResolvedValue(fakeToken({ id: "rt1" }));
      findById.mockResolvedValue(fakeUser());

      const result = await service.refresh("raw", { ipAddress: "127.0.0.1" });

      expect(revoke).toHaveBeenCalledWith("rt1");
      expect(generateAccessToken).toHaveBeenCalledWith({
        id: "u1",
        role: "CUSTOMER",
      });
      expect(create).toHaveBeenCalled();
      expect(result).toEqual({
        accessToken: "new-access",
        refreshToken: "new-raw",
      });
    });

    it("throws AccountDisabledException when the user is banned", async () => {
      findActiveByHash.mockResolvedValue(fakeToken());
      findById.mockResolvedValue({ ...fakeUser(), isBanned: true });

      await expect(service.refresh("raw")).rejects.toBeInstanceOf(
        AccountDisabledException,
      );
    });

    it("throws AccountDisabledException when the user is inactive", async () => {
      findActiveByHash.mockResolvedValue(fakeToken());
      findById.mockResolvedValue({ ...fakeUser(), isActive: false });

      await expect(service.refresh("raw")).rejects.toBeInstanceOf(
        AccountDisabledException,
      );
    });
  });

  describe("revokeByRawToken", () => {
    it("does nothing when there is no token", async () => {
      await service.revokeByRawToken(undefined);

      expect(findActiveByHash).not.toHaveBeenCalled();
      expect(revoke).not.toHaveBeenCalled();
    });

    it("revokes the matching token", async () => {
      findActiveByHash.mockResolvedValue(fakeToken({ id: "rt9" }));

      await service.revokeByRawToken("raw");

      expect(findActiveByHash).toHaveBeenCalledWith(hashRefreshToken("raw"));
      expect(revoke).toHaveBeenCalledWith("rt9");
    });

    it("does nothing when no token matches", async () => {
      findActiveByHash.mockResolvedValue(undefined);

      await service.revokeByRawToken("raw");

      expect(revoke).not.toHaveBeenCalled();
    });
  });
});
