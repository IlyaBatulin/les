# Миграция с Supabase на REG.RU Postgres

## Обязательные переменные окружения

Для запуска проекта после миграции необходимы:

| Переменная | Описание |
|------------|----------|
| `DATABASE_URL` | Строка подключения к Postgres REG.RU: `postgres://user:password@host:port/database?sslmode=require` |
| `NODEMAILER_USER` | SMTP-логин для отправки писем (формы, заказы) |
| `NODEMAILER_PASSWORD` | SMTP-пароль |
| `NODEMAILER_TARGET` | Email получателя заявок |
| `ADMIN_USERNAME` | Логин админки (только сервер, не NEXT_PUBLIC) |
| `ADMIN_PASSWORD` | Пароль админки (только сервер, не NEXT_PUBLIC) |

Файл CA-сертификата для TLS: `certs/regru-ca.pem` (или путь в `NODE_EXTRA_CA_CERTS` при dev).

## Supabase удалён

Переменные Supabase больше не используются и удалены из конфигурации.

## Проверка работы

1. Запуск dev:
   ```bash
   npm run dev
   ```

2. Диагностика env:
   ```bash
   curl http://localhost:3000/api/health/env
   ```
   Ожидается: `{ "databaseUrlSet": true, "supabaseUrlSet": false, "supabaseAnonSet": false }` (если Supabase убран).

3. Проверка БД:
   ```bash
   curl http://localhost:3000/api/health/db
   ```

4. Проверка каталога:
   - `GET /api/categories` — дерево категорий
   - `GET /api/products` — список товаров
   - Открыть в браузере: http://localhost:3000/catalog

5. Скрипт проверки изображений товаров:
   - `node scripts/check-products-images.js` — требует запущенного dev-сервера (использует fetch к /api/products)
