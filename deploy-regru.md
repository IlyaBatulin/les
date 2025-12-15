# Инструкция по деплою на REG.RU

## Вариант 1: VPS/VDS сервер (Рекомендуется)

### Требования:
- VPS/VDS с Ubuntu/CentOS
- Node.js 18+ установлен
- PM2 для управления процессом
- Nginx для reverse proxy

### Шаги деплоя:

#### 1. Подключитесь к серверу по SSH
```bash
ssh root@ваш_ip_адрес
```

#### 2. Установите Node.js (если не установлен)
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs
```

#### 3. Установите PM2
```bash
npm install -g pm2
```

#### 4. Создайте директорию для сайта
```bash
mkdir -p /var/www/lesopilka
cd /var/www/lesopilka
```

#### 5. Загрузите файлы на сервер

**Способ А: Через Git (рекомендуется)**
```bash
git clone https://github.com/ваш_репозиторий.git .
```

**Способ Б: Через FTP/SFTP**
- Загрузите все файлы проекта через FileZilla или WinSCP

#### 6. Установите зависимости и соберите проект
```bash
npm install --production
npm run build
```

#### 7. Создайте файл .env.production
```bash
nano .env.production
```

Вставьте ваши переменные:
```
NEXT_PUBLIC_SUPABASE_URL=https://ohkjgjvsuppbwcnvoquq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ваш_ключ
SUPABASE_SERVICE_ROLE_KEY=ваш_секретный_ключ
```

#### 8. Запустите сайт через PM2
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 9. Настройте Nginx

Создайте конфигурацию:
```bash
nano /etc/nginx/sites-available/lesopilka
```

Вставьте конфигурацию:
```nginx
server {
    listen 80;
    server_name ваш_домен.ru www.ваш_домен.ru;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Статические файлы Next.js
    location /_next/static {
        alias /var/www/lesopilka/.next/static;
        expires 365d;
        access_log off;
    }

    location /public {
        alias /var/www/lesopilka/public;
        expires 30d;
        access_log off;
    }
}
```

Активируйте конфигурацию:
```bash
ln -s /etc/nginx/sites-available/lesopilka /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

#### 10. Установите SSL сертификат (опционально, но рекомендуется)
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d ваш_домен.ru -d www.ваш_домен.ru
```

### Управление сайтом:
```bash
pm2 status              # Статус
pm2 restart lesopilka-site  # Перезапуск
pm2 logs lesopilka-site     # Логи
pm2 stop lesopilka-site     # Остановка
```

---

## Вариант 2: Обычный хостинг REG.RU (статический экспорт)

⚠️ **Внимание:** На обычном хостинге без Node.js вы потеряете серверные функции Next.js (API routes, Server Components, ISR).

### Шаги:

#### 1. Измените next.config.mjs для статического экспорта
Добавьте:
```javascript
output: 'export',
```

#### 2. Соберите статический сайт
```bash
npm run build
```

#### 3. Загрузите папку `out` на хостинг
- Все файлы из папки `out` загрузите в корневую директорию сайта на REG.RU через FTP

#### 4. Настройте .htaccess (если Apache)
Создайте файл `.htaccess` в корне:
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [L]
```

---

## Рекомендация:

Для вашего проекта с Supabase **лучше использовать VPS** или альтернативные платформы:

### Альтернативы REG.RU (бесплатные/дешевые):
1. **Vercel** (рекомендуется для Next.js) - бесплатно
   - Автоматический деплой из GitHub
   - https://vercel.com

2. **Netlify** - бесплатно
   - Простой деплой
   - https://netlify.com

3. **Railway** - $5/месяц
   - Простой деплой из GitHub
   - https://railway.app

Если выберете один из вариантов - дам подробную инструкцию!

