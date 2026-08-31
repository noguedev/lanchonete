import { env } from "../../../env/env.js";
import { EmailOrPasswordException } from "../../user/exceptions/email-or-password.exception.js";
import type { UserRepository } from "../../user/user.repository.js";
import type { LoginUserDto } from "../auth.dtos.js";
import type { RefreshTokenRepository } from "../refresh-token.repository.js";
import type { JwtAndTokenRefresh } from "../types/jwt-and-token-refresh.js";
import { JwtService } from "./jwt.service.js";
import type { PasswordHash } from "./password-hash.service.js";

type LoginContext = {
  userAgent?: string;
  ipAddress?: string;
};

function parseExpiresIn(value: string): number {
  const match = /^(\d+)([smhdw])?$/.exec(value.trim());
  if (!match) return 0;

  const amount = Number(match[1]);
  const unit = match[2] ?? "s";

  const multipliers = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
    w: 604800,
  } as const;

  return amount * multipliers[unit as keyof typeof multipliers];
}

export class LoginUserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly passwordHasherService: PasswordHash,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute(data: LoginUserDto, context: LoginContext = {}): Promise<JwtAndTokenRefresh> {
    const userExists = await this.userRepository.findByEmail(data.email);

    if (userExists.length <= 0) {
      throw new EmailOrPasswordException();
    }

    const passwordMatches = await this.passwordHasherService.validade(
      userExists[0]?.passwordHash!,
      data.password,
    );

    if (!passwordMatches) {
      throw new EmailOrPasswordException();
    }

    const user = userExists[0]!;

    const acessToken = await this.jwtService.generateAccessToken({
      id: user.id,
      role: user.role,
    });
    const refreshToken = this.jwtService.generateRefreshToken();

    const tokenHash = await this.passwordHasherService.hash(refreshToken);

    const expiresAt = new Date(
      Date.now() + parseExpiresIn(env.REFRESH_TOKEN_EXPIRES_IN) * 1000,
    );

    await this.refreshTokenRepository.create({
      userId: user.id,
      tokenHash,
      expiresAt,
      userAgent: context.userAgent,
      ipAddress: context.ipAddress,
    });

    return {
      JwtToken: acessToken,
      TokenRefresh: refreshToken,
    };
  }
}
