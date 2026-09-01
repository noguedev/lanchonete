import type { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../../models/exception-base.js";
import type { LoginUserService } from "./services/login-user.service.js";
import type { RefreshTokenService } from "./services/refresh-token.service.js";
import type { LoginUserDto } from "./auth.dtos.js";

const REFRESH_COOKIE = "refresh_token";

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  path: "/",
} as const;

export class AuthController {
  constructor(
    private readonly loginUserService: LoginUserService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async login(
    request: FastifyRequest<{
      Body: LoginUserDto;
    }>,
    reply: FastifyReply,
  ) {
    const result = await this.loginUserService.execute(
      request.body,
      this.extractContext(request),
    );

    reply.setCookie(REFRESH_COOKIE, result.TokenRefresh, REFRESH_COOKIE_OPTIONS);

    return reply.status(201).send({
      acessToken: result.JwtToken,
    });
  }

  async refresh(request: FastifyRequest, reply: FastifyReply) {
    try {
      const result = await this.refreshTokenService.refresh(
        request.cookies[REFRESH_COOKIE],
        this.extractContext(request),
      );

      reply.setCookie(REFRESH_COOKIE, result.TokenRefresh, REFRESH_COOKIE_OPTIONS);

      return reply.status(200).send({
        acessToken: result.JwtToken,
      });
    } catch (error) {
      if (error instanceof AppError) {
        reply.clearCookie(REFRESH_COOKIE, { path: "/" });
      }

      throw error;
    }
  }

  private extractContext(request: FastifyRequest) {
    const userAgent =
      typeof request.headers["user-agent"] === "string"
        ? request.headers["user-agent"]
        : undefined;

    const context: { userAgent?: string; ipAddress?: string } = {
      ipAddress: request.ip,
    };

    if (userAgent) {
      context.userAgent = userAgent;
    }

    return context;
  }
}
