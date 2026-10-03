# Обновление сайта на VPS REG.RU

Репозиторий: https://github.com/IlyaBatulin/les, ветка `main`.
Сайт: https://vyborplus.ru. Адрес VPS для проверки доступа: `194.58.114.111`.

Проект требует Node.js: каталог, админка, заказы и почта используют серверные обработчики. Статический экспорт и загрузка HTML через FTP для него не подходят.

## Что нужно подтвердить на сервере

В существующих скриптах указаны `/var/www/lesopilka` и процесс PM2 `lesopilka-site`. Это настройки репозитория, а не подтверждение фактического устройства VPS. До обновления проверить:

```bash
ssh root@194.58.114.111
node --version
npm --version
pm2 list
pm2 describe lesopilka-site
```

По рабочему каталогу из PM2 найти проект, затем проверить `git status`, `git remote -v`, `git branch --show-current` и настройки Nginx. Минимальная версия Node.js для установленных Next.js и Sharp — 20.9.0. Сборка требует также devDependencies, включая TypeScript и Tailwind.

Пароль SSH доступен в карточке VPS, раздел «Доступы»: [инструкция REG.RU](https://help.reg.ru/support/klassicheskie-vps/zakaz-i-upravleniye-vps/informatsiya-o-vklyuchennykh-servisakh-i-parolyakh-dostupa-dlya-vps). Вход по ключу этого компьютера пока не подтверждён.

## Рабочие настройки и данные

Сохранить существующие серверные `.env*`, `public/uploads`, текущую сборку и резервную копию PostgreSQL до обновления. Зафиксировать текущий коммит командой `git rev-parse HEAD`. Резервные копии хранить вне каталога сайта и Git.

Не заменять серверный env локальным: локальная копия использует снимок каталога и не содержит подтверждённого подключения к рабочей базе. Приоритет `.env.local` выше `.env.production`, поэтому проверить оба файла и окружение PM2 без вывода секретов в логи.

На сервере до сборки и запуска должны быть заданы:

```dotenv
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
ADMIN_USERNAME=REPLACE_ME
ADMIN_PASSWORD=REPLACE_ME
ADMIN_SESSION_SECRET=REPLACE_WITH_RANDOM_SECRET
SITE_URL=https://vyborplus.ru
SMTP_HOST=smtp.mail.ru
SMTP_PORT=465
NODEMAILER_USER=REPLACE_ME
NODEMAILER_PASSWORD=REPLACE_ME
NODEMAILER_TARGET=zakaz@vyborplus.ru
```

Значения выше — шаблон, не действующие реквизиты. `ADMIN_SESSION_SECRET` должен быть отдельным случайным секретом минимум из 32 байт. Секреты не добавлять в Git. Файлы env должны читаться только владельцем процесса сайта.

Подключение PostgreSQL проверяет CA из `certs/regru-ca.pem` и имя хоста в сертификате. При отдельном TLS-имени провайдера используется `DATABASE_TLS_SERVERNAME`. Не отключать проверку сертификата. `DATABASE_SSL=disable` допустим только для локальных development-тестов. `CATALOG_PREVIEW` и `CATALOG_PREVIEW_DATA_DIR` на VPS не нужны.

## Порядок обновления

Сначала проверить реальный путь проекта, локальные изменения и резервные копии. Приведённые команды рассчитаны на подтверждённую конфигурацию из репозитория:

```bash
cd /var/www/lesopilka
git fetch origin main
git log --oneline HEAD..origin/main
git pull --ff-only origin main
npm ci --include=dev --legacy-peer-deps
npm run test:admin
npm run test:catalog
npm run build
pm2 restart lesopilka-site --update-env
pm2 status
```

Выполнять следующий шаг только после успешного предыдущего. После первоначальной проверки можно использовать `bash deploy-pull.sh`: он останавливается при ошибке, устанавливает зависимости по lock-файлу, запускает тесты и сборку перед перезапуском.

Это обновление в рабочем каталоге одного процесса; оно не гарантирует работу без перерыва, поскольку сборка заменяет `.next`. Выполнять в согласованное окно обслуживания. Автоматический откат не настроен. При сбое нужны сохранённая сборка либо возврат к прежнему коммиту с повторной установкой зависимостей и сборкой.

Для первого запуска используется `pm2 start ecosystem.config.js`, затем `pm2 save`; существующий процесс не дублировать. Собирать проект непосредственно на Linux-сервере: старый `deploy.sh`, копирующий `node_modules` и `.next` с компьютера, для переноса Windows → Linux не использовать.

## Проверки после обновления

- Проверить `pm2 logs lesopilka-site --lines 100 --nostream` и ответы главной страницы, каталога и видео `/media/vyborplus.mp4`.
- Проверить вход и выход в админке по HTTPS. Production-cookie требует HTTPS. Nginx должен передавать `Host`, `X-Forwarded-For` и `X-Forwarded-Proto`; приложение слушает порт 3000.
- Проверить подключение к реальной базе, товары, изображения, категории, редактирование и сохранение. Изолированные тесты не подтверждают совместимость фактической схемы VPS.
- Оформить явно помеченный тестовый заказ и проверить запись в админке и фактическое поступление письма в `zakaz@vyborplus.ru`. Успешная запись заказа не означает доставку почты: SMTP вызывается после сохранения заказа, автоматических повторов пока нет.

Локальные проверки: `npm run test:admin`, `npm run test:catalog`, `npm run build`, `npm audit --omit=dev`. Тест админки использует изолированный PostgreSQL в памяти и локальный SMTP-приёмник; рабочие данные и внешнюю почту не затрагивает.

На момент подготовки в репозитории не было GitHub Actions workflows. Публикация коммита сама по себе не подтверждает обновление сайта: возможную внешнюю автоматизацию нужно проверить на VPS.
