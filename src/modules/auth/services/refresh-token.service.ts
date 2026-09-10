import { env } from "../../../env/env.js";
import { InvalidRefreshTokenException } from "../exceptions/invalid-refresh-token.exception.js";
import { AccountDisabledException } from "../exceptions/account-disabled.exception.js";
import type { RefreshTokenRepository } from "../refresh-token.repository.js";
import type { AuthTokens } from "../types/auth-tokens.js";
import type { User } from "../../../models/index.js";
import type { UserRepository } from "../../user/user.repository.js";
import type { JwtService } from "./jwt.service.js";
import type { RefreshContext } from "../types/refresh-context.js";
import { hashRefreshToken } from "../util/hash-refresh-token.js";
import { parseExpiresIn } from "../util/parse-expires-in.js";


export class RefreshTokenService {
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async issueToken(userId: string, context: RefreshContext = {}): Promise<string> {
    const rawToken = this.jwtService.generateRefreshToken();

    const tokenHash = hashRefreshToken(rawToken);

    const expiresAt = new Date(
      Date.now() + parseExpiresIn(env.REFRESH_TOKEN_EXPIRES_IN) * 1000,
    );

    await this.refreshTokenRepository.create({
      userId,
      tokenHash,
      expiresAt,
      userAgent: context.userAgent,
      ipAddress: context.ipAddress,
    });

    return rawToken;
  }

  async refresh(rawToken: string | undefined, context: RefreshContext = {}): Promise<AuthTokens> {
    if (!rawToken) {
      throw new InvalidRefreshTokenException();
    }

    const matchedToken = await this.refreshTokenRepository.findActiveByHash(
      hashRefreshToken(rawToken),
    );

    if (!matchedToken) {
      throw new InvalidRefreshTokenException();
    }

    const user = await this.userRepository.findById(matchedToken.userId);

    if (!user) {
      throw new InvalidRefreshTokenException();
    }

    if (!user.isActive || user.isBanned) {
      throw new AccountDisabledException();
    }

    await this.refreshTokenRepository.revoke(matchedToken.id);

    return this.issueTokensForUser(user, context);
  }

  async revokeByRawToken(rawToken: string | undefined): Promise<void> {
    if (!rawToken) {
      return;
    }

    const matchedToken = await this.refreshTokenRepository.findActiveByHash(
      hashRefreshToken(rawToken),
    );

    if (matchedToken) {
      await this.refreshTokenRepository.revoke(matchedToken.id);
    }
  }

  private async issueTokensForUser(user: User, context: RefreshContext): Promise<AuthTokens> {
    const accessToken = await this.jwtService.generateAccessToken({
      id: user.id,
      role: user.role,
    });

    const refreshToken = await this.issueToken(user.id, context);

    return {
      accessToken,
      refreshToken,
    };
  }
}
