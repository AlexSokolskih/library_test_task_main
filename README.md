# Document Description API

Сервис на `NestJS + PostgreSQL` для выдачи описаний документов:
- постраничный JSON-список;
- полнотекстовый поиск;
- получение документа по `uuid`;
- потоковая выгрузка в `NDJSON`.


## Как устроен проект

В проекте один доменный модуль — `document-description`, внутри него два подмодуля: `search` и `stream`.

### `document-description`
Отвечает за HTTP-слой:
- эндпоинты;
- заголовки и формат ответа;
- пагинацию и параметры запроса;
- выбор режима ответа (JSON или NDJSON).

### `stream`
Оптимизирован под высокую нагрузку и потоковую выгрузку, поэтому пришдлсь пожертвовать чистотой кода.
- Читает данные из PostgreSQL через `pg-query-stream` (cursor-based подход).
- Преобразует строки в NDJSON.
- Отдает результат клиенту через `response` stream.

### `search`
search - тут я немного позволил себе творчески интерпретировать задание, добавил префиксный поиск по тексту,
 ранжирование по релевантности и приоритет точного совпадения для поиска по номеру. И одновременный поиск по английскому и русскому языкам.

Реализует полнотекстовый поиск с дополнительной логикой:
- префиксный поиск (`слово:*`);
- ранжирование по релевантности;
- пСовпадения по `reg_number` возвращаются выше остальных результатов;
- поиск одновременно по русской и английской конфигурациям.

Пример:
- запрос `библиотека` находит документы со словами `библиотека`, `библиотекарь`, `библиотечный`;
- запрос `учебник node.js` ищет оба термина в RU/EN полнотекстовых индексах;
- запрос `би` работает как префикс и находит слова вроде `библиотеки`, `библиографический`, `библиофонд`.

.

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



## Примеры запросов
export DOCUMENT_DESCRIPTION_TOKEN=change-me

JSON-список:

```bash
curl -G \
  -H "Authorization: Bearer $DOCUMENT_DESCRIPTION_TOKEN" \
  --data-urlencode "page=1" \
  --data-urlencode "per_page=10" \
  "http://localhost:3000/document-descriptions"
```

Поиск по слову `библиотека`:

```bash
curl -G \
  -H "Authorization: Bearer $DOCUMENT_DESCRIPTION_TOKEN" \
  --data-urlencode "page=1" \
  --data-urlencode "per_page=20" \
  --data-urlencode "search=библиотека" \
  "http://localhost:3000/document-descriptions"
```

Префиксный поиск `би`:

```bash
curl -G \
  -H "Authorization: Bearer $DOCUMENT_DESCRIPTION_TOKEN" \
  --data-urlencode "page=1" \
  --data-urlencode "per_page=20" \
  --data-urlencode "search=би" \
  "http://localhost:3000/document-descriptions"
```

Поиск по слову `python`:

```bash
curl -G \
  -H "Authorization: Bearer $DOCUMENT_DESCRIPTION_TOKEN" \
  --data-urlencode "page=1" \
  --data-urlencode "per_page=20" \
  --data-urlencode "search=python" \
  "http://localhost:3000/document-descriptions"
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
  "http://localhost:3000/document-descriptions/123e4567-e89b-12d3-a456-426614174000"
```
