#!/bin/bash
# Скрипт для автоматического деплоя на VPS

echo "🚀 Начинаем деплой на сервер..."

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Переменные (замените на свои)
SERVER_IP="ваш_ip_сервера"
SERVER_USER="root"
PROJECT_DIR="/var/www/lesopilka"
APP_NAME="lesopilka-site"

echo -e "${YELLOW}1. Собираем проект локально...${NC}"
npm run build

echo -e "${YELLOW}2. Архивируем файлы...${NC}"
tar -czf deploy.tar.gz \
  .next \
  public \
  node_modules \
  package*.json \
  next.config.mjs \
  ecosystem.config.js \
  .env.production

echo -e "${YELLOW}3. Загружаем на сервер...${NC}"
scp deploy.tar.gz $SERVER_USER@$SERVER_IP:$PROJECT_DIR/

echo -e "${YELLOW}4. Распаковываем и перезапускаем...${NC}"
ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
cd /var/www/lesopilka
tar -xzf deploy.tar.gz
rm deploy.tar.gz
pm2 restart lesopilka-site
ENDSSH

echo -e "${GREEN}✅ Деплой завершен!${NC}"
echo "Сайт доступен по адресу: http://$SERVER_IP:3000"

# Удаляем локальный архив
rm deploy.tar.gz

