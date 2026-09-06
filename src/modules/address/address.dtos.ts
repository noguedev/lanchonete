import { z } from "zod";

export const createAddressSchema = z.object({
  label: z
    .string()
    .max(50, "O rótulo deve possuir no máximo 50 caracteres.")
    .optional(),

  recipientName: z
    .string()
    .max(100, "O nome do destinatário deve possuir no máximo 100 caracteres.")
    .optional(),

  phone: z
    .string()
    .max(20, "O telefone deve possuir no máximo 20 caracteres.")
    .optional(),

  street: z
    .string()
    .min(3, "Informe a rua/avenida.")
    .max(150, "A rua deve possuir no máximo 150 caracteres."),

  number: z
    .string()
    .min(1, "Informe o número.")
    .max(20, "O número deve possuir no máximo 20 caracteres."),

  complement: z
    .string()
    .max(100, "O complemento deve possuir no máximo 100 caracteres.")
    .optional(),

  neighborhood: z
    .string()
    .max(100, "O bairro deve possuir no máximo 100 caracteres.")
    .optional(),

  city: z
    .string()
    .min(2, "Informe a cidade.")
    .max(100, "A cidade deve possuir no máximo 100 caracteres."),

  state: z
    .string()
    .length(2, "Informe a UF (2 letras)."),

  postalCode: z
    .string()
    .min(8, "Informe um CEP válido.")
    .max(10, "O CEP deve possuir no máximo 10 caracteres."),

  isDefault: z.boolean().optional(),
});

export type CreateAddressDTO = z.infer<typeof createAddressSchema>;

export const updateAddressSchema = z.object({
  label: z.string().max(50).optional(),
  recipientName: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  street: z.string().min(3).max(150).optional(),
  number: z.string().min(1).max(20).optional(),
  complement: z.string().max(100).optional(),
  neighborhood: z.string().max(100).optional(),
  city: z.string().min(2).max(100).optional(),
  state: z.string().length(2).optional(),
  postalCode: z.string().min(8).max(10).optional(),
  isDefault: z.boolean().optional(),
});

export type UpdateAddressDTO = z.infer<typeof updateAddressSchema>;

export const addressParamsSchema = z.object({
  id: z.uuid("Informe um id de endereço válido."),
});

export type AddressParams = z.infer<typeof addressParamsSchema>;
