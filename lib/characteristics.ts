// Единая логика работы с ключами характеристик товаров.
// В базе встречаются и русские («Толщина»), и английские («thickness») ключи —
// без канонизации они превращаются в дублирующиеся фильтры.

const TRANSLATIONS: Record<string, string> = {
  pieces_per_cubic_meter: "Штук в м³",
  "pieces per cubic meter": "Штук в м³",
  grade: "Сорт",
  drying: "Сушка",
  wood_type: "Порода",
  size: "Размер",
  standard: "Стандарт",
  thickness: "Толщина",
  width: "Ширина",
  length: "Длина",
  moisture: "Влажность",
  surface_treatment: "Обработка",
  "surface treatment": "Обработка",
  purpose: "Назначение",
  material: "Материал",
  country: "Страна",
  color: "Цвет",
  weight: "Вес",
  coating: "Покрытие",
  power: "Мощность",
  features: "Особенности",
  warranty: "Гарантия",
  dimensions: "Размер",
  manufacturer: "Производитель",
  origin: "Происхождение",
}

/**
 * Каноническое (отображаемое) имя ключа характеристики.
 * «thickness», «Толщина» и «толщина» дают один и тот же результат — «Толщина».
 */
export function canonicalKey(key: string): string {
  if (!key || typeof key !== "string") return String(key || "")

  const lower = key.toLowerCase()
  if (TRANSLATIONS[lower]) return TRANSLATIONS[lower]

  const normalized = lower.replace(/_/g, " ")
  if (TRANSLATIONS[normalized]) return TRANSLATIONS[normalized]

  // Русские ключи приводим к виду «С заглавной буквы»
  return key
    .replace(/_/g, " ")
    .trim()
    .split(" ")
    .map((word, i) => (i === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(" ")
}

/** Обратная совместимость: то же, что canonicalKey. */
export const formatKey = canonicalKey

// Известные варианты одного и того же значения, которые встречаются в базе
// из-за опечаток и ручного ввода («хвоя», «Хвоя (сосна, есль)», «Хвоя (сосна,ель)» —
// это одно и то же значение «Хвоя (сосна, ель)»). Ключи — в нижнем регистре,
// после нормализации пунктуации.
const VALUE_ALIASES: Record<string, string> = {
  "хвоя": "Хвоя (сосна, ель)",
  "хвоя (сосна, есль)": "Хвоя (сосна, ель)",
}

/** Нормализует значение характеристики: схлопывает пробелы, чинит пунктуацию, убирает крайние. */
export function canonicalValue(value: unknown): string {
  const cleaned = String(value)
    .replace(/\s+/g, " ")
    .replace(/,(?=\S)/g, ", ") // "сосна,ель" -> "сосна, ель"
    .trim()

  const alias = VALUE_ALIASES[cleaned.toLowerCase()]
  return alias || cleaned
}

/** Сравнение значений характеристик без учёта регистра и лишних пробелов. */
export function valuesEqual(a: string, b: string): boolean {
  return canonicalValue(a).toLowerCase() === canonicalValue(b).toLowerCase()
}

/**
 * Приводит характеристики товара к каноническим ключам,
 * объединяя рус./англ. дубликаты.
 */
export function normalizeCharacteristics(
  characteristics: Record<string, unknown> | null | undefined,
): Record<string, string> {
  const result: Record<string, string> = {}
  if (!characteristics || typeof characteristics !== "object") return result
  Object.entries(characteristics).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") return
    const canon = canonicalKey(key)
    // Не затираем уже записанное значение (русский ключ приоритетнее)
    if (!(canon in result)) {
      result[canon] = canonicalValue(value)
    }
  })
  return result
}
