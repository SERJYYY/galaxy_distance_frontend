# ---------- Stage 1: Development ----------
FROM node:20-alpine AS development

WORKDIR /app

# Копируем package.json и package-lock.json для установки зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь проект
COPY . .

# Команда для разработки (vite dev server)
CMD ["npm", "run", "dev"]

# ---------- Stage 2: Production ----------
FROM nginx:alpine AS production

# Удаляем дефолтную конфигурацию nginx
RUN rm -rf /usr/share/nginx/html/*

# Копируем собранный фронт из стейджа development
COPY --from=development /app/dist /usr/share/nginx/html

# Пробрасываем порт
EXPOSE 80

# Запуск nginx
CMD ["nginx", "-g", "daemon off;"]