import fastifySwagger from "@fastify/swagger";
import { userRoutes } from "./modules/user/user.routes.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import {
  serializerCompiler,
  validatorCompiler,
  jsonSchemaTransform
} from "fastify-type-provider-zod";

import Fastify from "fastify";
import fastifySwaggerUi from "@fastify/swagger-ui";
import jwt from "./plugins/jwt.js";
import cookie from "./plugins/cookie.js";
import { errorHandler } from "./filter/error-handle.js";

export const app = Fastify({
  logger: true,
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
app.setErrorHandler(errorHandler);

app.register(fastifySwagger, {
  openapi: {
    openapi: "3.0.0",
    info: {
      title: "Lanchonete API",
      description: "Api para gerenciamento de pedidos para uma lanchonete",
      version: "0.0.1",
    },
  },
  transform: jsonSchemaTransform
});


app.register(jwt);
app.register(cookie);

// Pages 
app.register(fastifySwaggerUi, {
  routePrefix: "/documentation",
});

app.register(authRoutes, {
  prefix: "/auth"
})

app.register(userRoutes, {
  prefix: "/users",
});


