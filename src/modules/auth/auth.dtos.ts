import z from "zod";

export const loginUserSchema = z.object({
  email: z.email("Informe um endereço de email válido."),
  password: z
    .string()
    .min(8, "A senha deve possuir pelo menos 8 caracteres.")
    .max(100, "Senha inválida"),
});

export type LoginUserDto = z.infer<typeof loginUserSchema>;
