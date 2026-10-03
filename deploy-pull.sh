#!/bin/bash
set -euo pipefail
# Скрипт для обновления проекта на сервере через git pull

echo "🔄 Обновление проекта с GitHub..."

# Переменные (замените на свои)
PROJECT_DIR="/var/www/lesopilka"
APP_NAME="lesopilka-site"

cd "$PROJECT_DIR"

echo "📥 Получаем изменения с GitHub..."
git pull --ff-only origin main

echo "📦 Устанавливаем зависимости..."
npm ci --include=dev --legacy-peer-deps

npm run test:admin
npm run test:catalog

echo "🔨 Собираем проект..."
npm run build

echo "🔄 Перезапускаем приложение..."
pm2 restart "$APP_NAME" --update-env

echo "✅ Обновление завершено!"
pm2 status








