import { createClient } from "@supabase/supabase-js"

// Создаем клиент Supabase для серверной стороны
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Отсутствуют переменные окружения для Supabase")
  }

  return createClient(supabaseUrl, supabaseKey)
}

// Создаем клиент Supabase для клиентской стороны с использованием синглтона
let clientSupabaseClient: ReturnType<typeof createClient> | null = null

export const createClientSupabaseClient = () => {
  if (clientSupabaseClient) return clientSupabaseClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("Отсутствуют переменные окружения для Supabase на клиентской стороне")
    throw new Error("Не удалось инициализировать Supabase клиент")
  }

  try {
    clientSupabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  } catch (error) {
    console.error("Ошибка при создании Supabase клиента:", error)
    throw new Error("Не удалось создать Supabase клиент")
  }

  return clientSupabaseClient
}
