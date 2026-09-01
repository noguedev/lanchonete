import { EmailOrPasswordException } from "../../user/exceptions/email-or-password.exception.js";
import type { UserRepository } from "../../user/user.repository.js";
import type { LoginUserDto } from "../auth.dtos.js";
import type { JwtAndTokenRefresh } from "../types/jwt-and-token-refresh.js";
import type { JwtService } from "./jwt.service.js";
import type { PasswordHash } from "./password-hash.service.js";
import type { RefreshTokenService } from "./refresh-token.service.js";
import type { RefreshContext } from './../types/index.js'

export class LoginUserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly passwordHasherService: PasswordHash,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async execute(
    data: LoginUserDto,
    context: RefreshContext = {},
  ): Promise<JwtAndTokenRefresh> {
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

    const refreshToken = await this.refreshTokenService.issueToken(
      user.id,
      context,
    );

    return {
      JwtToken: acessToken,
      TokenRefresh: refreshToken,
    };
  }
}
