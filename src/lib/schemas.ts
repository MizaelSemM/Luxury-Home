import { z } from "zod";

export const projectSchema = z.object({
  title: z
    .string()
    .min(1, "Título é obrigatório")
    .max(200, "Título muito longo"),
  description: z
    .string()
    .min(1, "Descrição é obrigatória")
    .max(5000, "Descrição muito longa"),
  location: z
    .string()
    .min(1, "Localização é obrigatória")
    .max(200, "Localização muito longa"),
  squareMeters: z
    .number({ required_error: "Metragem é obrigatória" })
    .int("Deve ser um número inteiro")
    .positive("Deve ser maior que zero"),
  imagesUrl: z
    .array(z.string().url("URL inválida").or(z.string().length(0)))
    .optional()
    .default([]),
  highlight: z.boolean().optional().default(false),
});

export const testimonialSchema = z.object({
  clientName: z
    .string()
    .min(1, "Nome do cliente é obrigatório")
    .max(200, "Nome muito longo"),
  role: z
    .string()
    .min(1, "Cargo é obrigatório")
    .max(200, "Cargo muito longo"),
  text: z
    .string()
    .min(1, "Depoimento é obrigatório")
    .max(2000, "Depoimento muito longo"),
  rating: z
    .number({ required_error: "Nota é obrigatória" })
    .int("Deve ser um número inteiro")
    .min(1, "Nota mínima é 1")
    .max(5, "Nota máxima é 5"),
  avatarUrl: z
    .string()
    .url("URL inválida")
    .nullable()
    .optional()
    .default(null),
});

export const contactSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(200, "Nome muito longo"),
  email: z
    .string()
    .min(1, "E-mail é obrigatório")
    .email("E-mail inválido"),
  message: z
    .string()
    .min(1, "Mensagem é obrigatória")
    .max(5000, "Mensagem muito longa"),
});

export type ProjectInput = z.infer<typeof projectSchema>;
export type TestimonialInput = z.infer<typeof testimonialSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
