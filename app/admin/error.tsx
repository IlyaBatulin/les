"use client"
export default function AdminError({ reset }: { reset: () => void }) {
  return <div role="alert" className="mx-auto max-w-xl p-8"><h1 className="text-2xl font-semibold">Не удалось загрузить данные</h1><p className="my-4">Проверьте подключение к базе и попробуйте ещё раз. Эта ошибка не означает, что товары или заказы удалены.</p><button className="primary-link" onClick={reset}>Повторить</button></div>
}
