# ---------- Development ----------
FROM node AS development

WORKDIR /app

# 1️⃣ Копируем только package.json для кэширования npm install
COPY package*.json ./

# 2️⃣ Устанавливаем зависимости
RUN npm install

# 3️⃣ Копируем модель ОТДЕЛЬНО (чтобы npm install не пересобирался)
# COPY models/ /app/models/

# 4️⃣ Копируем остальной проект
COPY . .

# 5️⃣ Открываем порт vite
EXPOSE 3000

# 6️⃣ Запуск dev сервера
CMD ["npm", "run", "dev", "--", "--host", "--port", "3000"]