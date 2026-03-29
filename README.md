# Document Description API

Сервис на `NestJS + PostgreSQL` для выдачи описаний документов:
- постраничный JSON-список;
- полнотекстовый поиск;
- получение документа по `uuid`;
- потоковая выгрузка в `NDJSON`.

## Что делает сервис

Доступны 2 эндпоинта:
- `GET /document-descriptions`  
  Режим по умолчанию: JSON с пагинацией и поиском.
  Если передать `Accept: application/ndjson`, сервис отдает поток `NDJSON`.
- `GET /document-descriptions/:uuid`  
  Возвращает один документ по UUID.

Все эндпоинты защищены Bearer-токеном (`DOCUMENT_DESCRIPTION_TOKEN`).

Swagger: `http://localhost:3000/api/docs`

## Стек

- `NestJS 11`
- `TypeORM 0.3` (основной доступ к данным)
- `PostgreSQL` (`pg`, `pg-query-stream`)
- `class-validator` + `class-transformer`
- `Swagger` (`@nestjs/swagger`)

## Переменные окружения

Пример `.env`:

```env
PORT=3000

DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=library

DOCUMENT_DESCRIPTION_TOKEN=super-secret-token
```

## Запуск

```bash
npm install
npm run start:dev
```

Миграции/сиды:

```bash
npm run migration:run
npm run seed
```

## Контракт API

### 1) Список документов

`GET /document-descriptions`

Query-параметры:
- `per_page?: number` (>= 1, по умолчанию `20`)
- `page?: number` (>= 1, по умолчанию `1`)
- `search?: string` (до `100` символов)

Заголовки:
- `Authorization: Bearer <DOCUMENT_DESCRIPTION_TOKEN>`
- `Accept: application/json` (по умолчанию) или `application/ndjson`

Ответ `application/json`:

```json
{
  "data": [
    {
      "system_number": 1,
      "uuid": "0f5bf8cc-5d72-4b10-9226-ae4f4f06b340",
      "reg_number": "REG-2026-001",
      "author": "Иванов И.И.",
      "title": "Описание документа",
      "imprint": "Москва, Издательство Пример, 2026"
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 1,
    "total_pages": 5,
    "search": "история"
  }
}
```

Важно по `meta.per_page`: это **фактическое количество элементов на текущей странице** (`items.length`), а не просто значение входного query-параметра.

Ответ `application/ndjson`:
- поток, где каждая строка — отдельный JSON-документ.

### 2) Документ по UUID

`GET /document-descriptions/:uuid`

Ответ:

```json
{
  "data": {
    "system_number": 1,
    "uuid": "0f5bf8cc-5d72-4b10-9226-ae4f4f06b340",
    "reg_number": "REG-2026-001",
    "author": "Иванов И.И.",
    "title": "Описание документа",
    "imprint": "Москва, Издательство Пример, 2026"
  }
}
```

## Ошибки

- `401 Unauthorized` — токен отсутствует или невалиден.
- `404 Not Found` — документ с указанным `uuid` не найден.
- `400 Bad Request` — невалидные query-параметры (`page`, `per_page`, `search`).

## Как устроен проект

```text
src/
  main.ts                         // bootstrap + Swagger
  app.module.ts                   // корневой модуль + TypeORM config
  database/
    db.config.ts                  // единая сборка DB-конфига для TypeORM и pg Pool
  document-description/
    document-description.controller.ts
    document-description.service.ts
    document-description.module.ts
    document-description.entity.ts
    dto/
    guards/
    search/
      search.service.ts
      repositories/document-description.repository.ts
    stream/
      stream.service.ts
      stream-pool.provider.ts
```

### Поток запроса (JSON-режим)

1. Контроллер валидирует query (`ValidationPipe` + DTO).
2. Guard проверяет `Authorization: Bearer ...`.
3. `DocumentDescriptionService` делегирует в `SearchService`.
4. `SearchService` выбирает стратегию:
   - без `search`: обычная пагинация;
   - с `search`: полнотекстовый поиск + приоритизация.
5. Контроллер формирует ответ `{ data, meta }`.

### Поток запроса (NDJSON-режим)

1. Клиент отправляет `Accept: application/ndjson`.
2. Контроллер передает управление `StreamService`.
3. `StreamService`:
   - берет raw-connection из `pg.Pool` (через `StreamPoolProvider`);
   - запускает `QueryStream` с `batchSize=1000`;
   - через `pipeline` стримит строки в ответ как NDJSON.
4. При `aborted/close` корректно останавливает пайплайн и освобождает DB-client.

## Почему решения такие

- **Разделение controller / service / repository**  
  Контроллер не знает про SQL, сервис не знает про HTTP-детали, репозиторий изолирует доступ к данным. Это упрощает тестирование и эволюцию кода.

- **Два канала доступа к БД (TypeORM и raw pg)**  
  Для обычных CRUD/поиска удобен `TypeORM`. Для больших выгрузок в потоковом режиме нужен контролируемый низкоуровневый стрим (`pg-query-stream`) без загрузки всех строк в память.

- **FTS + префиксный tsquery**  
  В поиске используется префиксный запрос (`word:* & ...`) для более “живого” UX (поиск по началу слов), плюс `reg_number` проверяется на точное совпадение и поднимается в выдаче.

- **Явная документация 401/404 в Swagger**  
  Клиентам сразу видно полный контракт не только успешных, но и ошибочных ответов.

## Примеры запросов

JSON-список:

```bash
curl -H "Authorization: Bearer $DOCUMENT_DESCRIPTION_TOKEN" \
  "http://localhost:3000/document-descriptions?page=1&per_page=20&search=история"
```

NDJSON-выгрузка:

```bash
curl -H "Authorization: Bearer $DOCUMENT_DESCRIPTION_TOKEN" \
  -H "Accept: application/ndjson" \
  "http://localhost:3000/document-descriptions" \
  -o export.ndjson
```

Документ по UUID:

```bash
curl -H "Authorization: Bearer $DOCUMENT_DESCRIPTION_TOKEN" \
  "http://localhost:3000/document-descriptions/0f5bf8cc-5d72-4b10-9226-ae4f4f06b340"
```
