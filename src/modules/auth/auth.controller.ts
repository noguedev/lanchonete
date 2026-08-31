import type { FastifyReply, FastifyRequest } from "fastify";
import type { LoginUserService } from "./services/login-user.service.js";
import type { LoginUserDto } from "./auth.dtos.js";

export class AuthController {
  constructor(private readonly loginUserService: LoginUserService) {}

  async login(
    request: FastifyRequest<{
      Body: LoginUserDto;
    }>,
    reply: FastifyReply,
  ) {
    const userAgent =
      typeof request.headers["user-agent"] === "string"
        ? request.headers["user-agent"]
        : undefined;

    const loginContext: { userAgent?: string; ipAddress?: string } = {
      ipAddress: request.ip,
    };

    if (userAgent) {
      loginContext.userAgent = userAgent;
    }

    const result = await this.loginUserService.execute(
      request.body,
      loginContext,
    );

    reply.setCookie("refresh_token", result.TokenRefresh, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });

    //TODO return better json
    return reply.status(201).send({
      acessToken: result.JwtToken,
    });
  }
}
