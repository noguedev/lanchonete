import type { FastifyReply, FastifyRequest } from "fastify";

import { makeAddItemToCartService } from "./factories/add-item-to-cart-service.factory.js";
import { makeGetCartService } from "./factories/get-cart-service.factory.js";
import { makeUpdateCartItemService } from "./factories/update-cart-item-service.factory.js";
import { makeRemoveCartItemService } from "./factories/remove-cart-item-service.factory.js";
import type {
  AddCartItemDTO,
  UpdateCartItemDTO,
  CartItemParams,
} from "./cart.dtos.js";

export class CartController {
  private readonly addItemToCartService = makeAddItemToCartService();
  private readonly getCartService = makeGetCartService();
  private readonly updateCartItemService = makeUpdateCartItemService();
  private readonly removeCartItemService = makeRemoveCartItemService();

  async addItem(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user.sub;

    await this.addItemToCartService.execute(
      userId,
      request.body as AddCartItemDTO,
    );

    return reply.status(201).send();
  }

  async get(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user.sub;

    const cart = await this.getCartService.execute(userId);

    return reply.status(200).send({ cart });
  }

  async updateItem(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user.sub;
    const productId = (request.params as CartItemParams).productId;

    const cart = await this.updateCartItemService.execute(
      userId,
      productId,
      request.body as UpdateCartItemDTO,
    );

    return reply.status(200).send({ cart });
  }

  async removeItem(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user.sub;
    const productId = (request.params as CartItemParams).productId;

    const cart = await this.removeCartItemService.execute(userId, productId);

    return reply.status(200).send({ cart });
  }
}
