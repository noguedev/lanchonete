import fastifySwagger from "@fastify/swagger";
import { userRoutes } from "./modules/user/user.routes.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { categoryRoutes } from "./modules/category/category.routes.js";
import { productRoutes } from "./modules/product/product.routes.js";
import { addressRoutes } from "./modules/address/address.routes.js";
import {
  serializerCompiler,
  validatorCompiler,
  jsonSchemaTransform
} from "fastify-type-provider-zod";

import Fastify from "fastify";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fastifyStatic from "@fastify/static";
import fastifyMultipart from "@fastify/multipart";
import fastifyCors from "@fastify/cors";
import fastifyRateLimit from "@fastify/rate-limit";
import jwt from "./plugins/jwt.js";
import cookie from "./plugins/cookie.js";
import { errorHandler } from "./filter/error-handle.js";
import { UPLOADS_DIR, MAX_IMAGE_SIZE_BYTES } from "./config/storage.js";
import { env } from "./env/env.js";
import fs from "node:fs";

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
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
        refreshTokenCookie: {
          type: 'apiKey',
          in: 'cookie',
          name: 'refresh_token'
        }
      },
    },
  },
  transform: jsonSchemaTransform
});


app.register(jwt);
app.register(cookie);

app.register(fastifyCors, {
  origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN.split(","),
  credentials: true,
});

app.register(fastifyRateLimit, {
  max: 100,
  timeWindow: "1 minute",
});

app.register(fastifyMultipart, {
  limits: { files: 1, fileSize: MAX_IMAGE_SIZE_BYTES },
});

fs.mkdirSync(UPLOADS_DIR, { recursive: true });

app.register(fastifyStatic, {
  root: UPLOADS_DIR,
  prefix: "/uploads/",
});

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

app.register(categoryRoutes, {
  prefix: "/categories",
});

app.register(productRoutes, {
  prefix: "/products",
});

app.register(addressRoutes, {
  prefix: "/addresses",
});


