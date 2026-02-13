# Админка: загрузка фото

## Что настроено

- **Лимит загрузки:** 10MB (next.config `serverActions.bodySizeLimit`)
- **Папка на сервере:** `public/uploads/` (создаётся автоматически при первой загрузке)
- **URL в БД:** относительный `/uploads/имя-файла.jpg`

## Проверки на REG.RU (продакшен)

1. **Права на папку `public/uploads`:**
   ```bash
   mkdir -p /var/www/les/public/uploads
   chmod 755 /var/www/les/public/uploads
   chown USER:USER /var/www/les/public/uploads   # USER — пользователь, под которым крутится приложение
   ```

2. **Nginx — лимит размера запроса** (если фото > 1MB не загружаются):
   ```nginx
   client_max_body_size 10M;
   ```
   Добавьте в `server { ... }` в конфиге Nginx.

3. **Локальное тестирование** (`npm run start`):
   В `.env.local` добавьте:
   ```
   ALLOW_INSECURE_COOKIE=1
   ```
   Чтобы кука `admin_session` работала на http://localhost.

## Удаление фото

Кнопка «×» в форме редактирования только **убирает ссылку** на фото из товара (в БД `image_url` становится `null`). Файл в `public/uploads/` остаётся на диске. Чтобы удалить неиспользуемые файлы, можно вручную почистить папку или добавить отдельный скрипт/админку.
