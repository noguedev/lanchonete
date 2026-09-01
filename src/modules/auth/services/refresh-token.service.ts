import { env } from "../../../env/env.js";
import { InvalidRefreshTokenException } from "../exceptions/invalid-refresh-token.exception.js";
import type { RefreshTokenRepository } from "../refresh-token.repository.js";
import type { JwtAndTokenRefresh } from "../types/jwt-and-token-refresh.js";
import type { RefreshToken, User } from "../../../models/index.js";
import type { UserRepository } from "../../user/user.repository.js";
import type { JwtService } from "./jwt.service.js";
import type { PasswordHash } from "./password-hash.service.js";
import type { RefreshContext } from './../types/index.js'
import { parseExpiresIn } from "../util/parse-expires-in.js";


export class RefreshTokenService {
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly passwordHasherService: PasswordHash,
  ) {}

  async issueToken(userId: string, context: RefreshContext = {}): Promise<string> {
    const rawToken = this.jwtService.generateRefreshToken();

    const tokenHash = await this.passwordHasherService.hash(rawToken);

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

  async refresh(rawToken: string | undefined, context: RefreshContext = {}): Promise<JwtAndTokenRefresh> {
    if (!rawToken) {
      throw new InvalidRefreshTokenException();
    }

    const activeTokens = await this.refreshTokenRepository.findActive();
    const matchedToken = await this.findMatchingToken(activeTokens, rawToken);

    if (!matchedToken) {
      throw new InvalidRefreshTokenException();
    }

    const user = await this.userRepository.findById(matchedToken.userId);

    if (!user) {
      throw new InvalidRefreshTokenException();
    }

    await this.refreshTokenRepository.revoke(matchedToken.id);

    const { JwtToken, TokenRefresh } = await this.issueTokensForUser(user, context);

    return { JwtToken, TokenRefresh };
  }

  private async issueTokensForUser(user: User, context: RefreshContext): Promise<JwtAndTokenRefresh> {
    const acessToken = await this.jwtService.generateAccessToken({
      id: user.id,
      role: user.role,
    });

    const tokenRefresh = await this.issueToken(user.id, context);

    return {
      JwtToken: acessToken,
      TokenRefresh: tokenRefresh,
    };
  }

  private async findMatchingToken(
    tokens: RefreshToken[],
    rawToken: string,
  ): Promise<RefreshToken | undefined> {
    for (const token of tokens) {
      const matches = await this.passwordHasherService.validade(
        token.tokenHash,
        rawToken,
      );

      if (matches) {
        return token;
      }
    }

    return undefined;
  }
}
