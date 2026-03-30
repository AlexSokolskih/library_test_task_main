FROM node:22-alpine
WORKDIR /app

# Dev-образ: ставим все зависимости (включая devDependencies)
ENV NODE_ENV=development
ENV CI=true

COPY package*.json ./
RUN npm ci

COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY src ./src
COPY test ./test

EXPOSE 3000

# Dev-режим: миграции и запуск Nest в watch-режиме
CMD ["sh", "-c", "npm run migration:run && npm run seed && npm run start:dev"]
