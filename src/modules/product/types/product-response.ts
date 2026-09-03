export type AdminProductResponse = {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export type PublicProductResponse = {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
};