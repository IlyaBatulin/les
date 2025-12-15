// PM2 конфигурация для запуска на сервере
module.exports = {
  apps: [
    {
      name: 'lesopilka-site',
      script: 'npm',
      args: 'start',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
}

