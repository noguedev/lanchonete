export type AddressResponse = {
  id: string;
  userId: string;
  label: string | null;
  recipientName: string | null;
  phone: string | null;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string | null;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string | null;
};