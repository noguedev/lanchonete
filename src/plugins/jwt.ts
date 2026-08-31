import fp from "fastify-plugin";
import fastifyJwt from "@fastify/jwt";
import { env } from "../env/env.js";

export default fp(async (fastify) => {
  await fastify.register(fastifyJwt, {
    secret: env.JWT_SECRET,
    sign: {
      expiresIn: "15m",
    },
  });
});