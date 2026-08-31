import { z } from "zod";

export const createUserSchema = z.object({
  name: z
    .string()
    .min(3, "O nome deve possuir pelo menos 3 caracteres.")
    .max(100, "O nome deve possuir no máximo 100 caracteres."),

  email: z.email("Informe um endereço de email válido."),

  // TODO validate phone
  phone: z
    .string()
    .max(20, "O telefone deve possuir no máximo 20 caracteres.")
    .optional(),

  password: z
    .string()
    .min(8, "A senha deve possuir pelo menos 8 caracteres.")
    .max(50, "A senha deve possuir no máximo 100 caracteres."),
});

export type CreateUserDTO = z.infer<typeof createUserSchema>;
