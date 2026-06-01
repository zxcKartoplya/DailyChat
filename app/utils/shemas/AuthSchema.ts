import * as z from 'zod'

export const authSchema = z.object({
  email: z.email('Невалидный email'),
  password: z.string('Пароль обязателен').min(8, 'Минимальная длина пароля 8 символов')
})

export type Schema = z.output<typeof authSchema>
