import { z } from "zod"
export class AdminError extends Error {
  constructor(message: string, public status = 400) { super(message) }
}
const text = z.string().trim()
const name = text.min(1, "Укажите название").max(300)
const money = z.number().finite().nonnegative().max(1_000_000_000)
const image = text.max(2048).refine(value => !value || /^\/(?!\/)/.test(value) || /^https?:\/\//.test(value), "Неверный адрес изображения").nullable()
export const productSchema = z.object({
  name, description: text.max(20000).nullable().default(null), price: money,
  price_per_cubic: money.nullable().default(null), image_url: image.default(null),
  category_id: z.number().int().positive(), unit: text.min(1).max(20).default("шт"),
  stock: z.number().finite().int().nonnegative().max(1_000_000_000).default(0),
  characteristics: z.record(z.string().min(1).max(100), z.union([z.string().max(2000), z.number().finite(), z.boolean(), z.null()])).default({}),
})
export const categorySchema = z.object({
  name, description: text.max(20000).nullable().default(null),
  parent_id: z.number().int().positive().nullable().default(null), image_url: image.default(null),
})
export const orderStatusSchema = z.enum(["new", "processing", "shipped", "delivered", "cancelled"])
export function positiveId(value: unknown): number {
  if (typeof value !== "string" && typeof value !== "number") throw new AdminError("Неверный идентификатор")
  if (!/^\d+$/.test(String(value)) || !Number.isSafeInteger(Number(value)) || Number(value) <= 0) throw new AdminError("Неверный идентификатор")
  return Number(value)
}
export function validated<S extends z.ZodTypeAny>(schema: S, input: unknown): z.output<S> {
  const parsed = schema.safeParse(input)
  if (!parsed.success) throw new AdminError(parsed.error.issues[0]?.message || "Некорректные данные")
  return parsed.data
}
