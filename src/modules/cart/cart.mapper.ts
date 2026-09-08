import type { CartItem, Product } from "../../models/index.js";

export type CartItemResponse = {
  productId: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  quantity: number;
  unitPrice: number;
  currentPrice: number;
  priceChanged: boolean;
  subtotal: number;
};

export type CartResponse = {
  items: CartItemResponse[];
  total: number;
  itemCount: number;
};

export type CartItemRow = {
  item: CartItem;
  product: Product;
};

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function samePrice(a: number, b: number): boolean {
  return Math.abs(a - b) < 0.001;
}

export function buildCartResponse(rows: CartItemRow[]): CartResponse {
  const items = rows.map(({ item, product }) => {
    const snapshotPrice = Number(item.unitPrice);
    const currentPrice = Number(product.price);

    return {
      productId: item.productId,
      name: product.name,
      slug: product.slug,
      imageUrl: product.imageUrl,
      quantity: item.quantity,
      unitPrice: snapshotPrice,
      currentPrice,
      priceChanged: !samePrice(snapshotPrice, currentPrice),
      subtotal: round2(item.quantity * currentPrice),
    };
  });

  return {
    items,
    total: round2(items.reduce((acc, item) => acc + item.subtotal, 0)),
    itemCount: items.reduce((acc, item) => acc + item.quantity, 0),
  };
}
