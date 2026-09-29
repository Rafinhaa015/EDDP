import { z } from 'zod';

export const emailSchema = z
  .string({ error: 'Informe o e-mail.' })
  .trim()
  .toLowerCase()
  .max(255)
  .pipe(z.email({ error: 'E-mail inválido.' }));

export const passwordSchema = z
  .string({ error: 'Informe a senha.' })
  .min(8, 'A senha precisa ter pelo menos 8 caracteres.')
  .max(72, 'A senha pode ter no máximo 72 caracteres.')
  .regex(/[A-Za-z]/, 'A senha precisa ter pelo menos uma letra.')
  .regex(/\d/, 'A senha precisa ter pelo menos um número.');

export const nameSchema = z
  .string({ error: 'Informe o nome completo.' })
  .trim()
  .min(3, 'Informe o nome completo.')
  .max(120, 'Nome muito longo.')
  .refine((v) => v.split(/\s+/).length >= 2, 'Informe nome e sobrenome.');

/** Telefone com DDI + DDD. Aceita "+55 (11) 91234-5678" e normaliza para "+5511912345678". */
export const phoneSchema = z
  .string({ error: 'Informe o telefone.' })
  .trim()
  .transform((v) => v.replace(/[^\d+]/g, ''))
  .transform((v) => (v.startsWith('+') ? v : `+${v}`))
  .refine((v) => /^\+\d{10,15}$/.test(v), 'Telefone inválido. Use DDI + DDD + número, ex.: +55 11 91234-5678.');
