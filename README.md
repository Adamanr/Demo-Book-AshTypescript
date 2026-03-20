# Handbooks — AshTypescript Demo

Демонстрационный проект, показывающий как связать **Elixir/Ash** бэкенд с **Next.js** фронтендом через автогенерируемые TypeScript-типы. Включает real-time обновления через Phoenix Channels, Presence-трекинг и полноценный CRUD для книг.

---

## Стек

| Слой | Технология |
|------|-----------|
| Бэкенд | Elixir, Phoenix 1.8, Ash 3.0 |
| База данных | PostgreSQL + AshPostgres |
| Кодогенерация | AshTypescript 0.15 |
| Авторизация | AshAuthentication (magic link) |
| Фронтенд | Next.js 16, React 19, TypeScript |
| Стили | Tailwind CSS 4 |
| Real-time | Phoenix Channels + PubSub + Presence |

---

## Быстрый старт

### Требования

- Elixir 1.18+
- Erlang/OTP 26+
- Node.js 20+
- PostgreSQL (по умолчанию `localhost:5431`)

### 1. Клонировать репозиторий

```bash
git clone <repo>
cd handbooks
```

### 2. Запустить бэкенд

```bash
# Установить зависимости, создать БД, запустить миграции
mix setup

# Запустить Phoenix сервер
mix phx.server
```

Бэкенд доступен на **http://localhost:4000**

### 3. Запустить фронтенд

```bash
cd frontend
npm install
npm run dev
```

Фронтенд доступен на **http://localhost:3000**

---

## Структура проекта

```
handbooks/
├── lib/
│   ├── handbooks/
│   │   ├── books/
│   │   │   └── book.ex          # Ash ресурс — главная сущность
│   │   ├── accounts/
│   │   │   ├── user.ex          # Пользователь + магические ссылки
│   │   │   └── token.ex
│   │   ├── pub_sub.ex           # Обёртка над Phoenix.PubSub
│   │   └── presence.ex          # Трекинг онлайн-пользователей
│   └── handbooks_web/
│       ├── channels/
│       │   └── books_channel.ex # WebSocket канал для real-time
│       ├── controllers/
│       │   └── ash_typescript_rpc_controller.ex
│       └── router.ex
│
├── assets/js/
│   ├── ash_rpc.ts               # Базовый RPC клиент (генерируется)
│   └── ash_generated.ts         # Типизированные функции (генерируется)
│
├── frontend/                    # Next.js приложение
│   ├── app/
│   │   ├── page.tsx             # Главная страница
│   │   └── books/
│   │       ├── page.tsx         # Server Component (SSR)
│   │       └── books-client.tsx # Client Component (CRUD + real-time)
│   └── lib/
│       ├── ash_generated.ts     # Копия сгенерированных типов
│       ├── ash-client.ts        # Конфигурация Phoenix соединения
│       └── use-realtime-books.ts # React хук для WebSocket
│
├── priv/repo/migrations/        # Миграции БД
├── config/
│   ├── config.exs               # Общий конфиг (AshTypescript настройки)
│   ├── dev.exs                  # Dev окружение
│   └── runtime.exs              # Production конфиг
└── ARTICLE.md                   # Анализ AshTypescript vs альтернативы
```

---

## Доступные страницы

| URL | Описание |
|-----|----------|
| `http://localhost:3000` | Главная страница фронтенда |
| `http://localhost:3000/books` | CRUD книг + real-time обновления |
| `http://localhost:4000` | Phoenix (AshTypescript demo) |
| `http://localhost:4000/ash-typescript` | Демо страница с примерами |
| `http://localhost:4000/admin` | AshAdmin — управление ресурсами |
| `http://localhost:4000/dev/dashboard` | Phoenix LiveDashboard |
| `http://localhost:4000/dev/mailbox` | Просмотр отправленных писем (dev) |

---

## Как работает AshTypescript

### 1. Описываешь ресурс в Ash

```elixir
# lib/handbooks/books/book.ex
typescript do
  type_name "Book"

  rpc_action :list_books, :list_books
  rpc_action :create_book, :create_book
  rpc_action :update_book, :update_book
  rpc_action :delete_book, :delete_book
end
```

### 2. Генерируешь TypeScript клиент

```bash
mix ash_typescript.codegen
```

Копируешь сгенерированный файл во фронтенд:

```bash
cp assets/js/ash_generated.ts frontend/lib/ash_generated.ts
```

### 3. Используешь типизированные функции

```typescript
import { listBooks, createBook, updateBook, deleteBook } from "@/lib/ash_generated";

// Получить список книг
const result = await listBooks({
  fields: ["id", "title", "author", "genre"] as const
});

if (result.success) {
  console.log(result.data); // типизировано!
}

// Создать книгу
await createBook({
  input: { title: "Война и мир", author: "Толстой" },
  fields: ["id", "title"] as const
});
```

---

## Real-time обновления

Проект использует Phoenix Channels для мгновенной синхронизации между клиентами:

- **Создание/редактирование/удаление** книги → все открытые вкладки обновляются автоматически
- **Лента активности** — показывает последние 20 действий в реальном времени
- **Счётчик зрителей** — сколько человек сейчас смотрит страницу (Phoenix Presence)

```typescript
// frontend/lib/use-realtime-books.ts
const { books, viewers, activity } = useRealtimeBooks(initialBooks);
```

Чтобы увидеть в действии — открой `http://localhost:3000/books` в двух вкладках одновременно.

---

## Mix задачи

```bash
# Первоначальная настройка (deps + БД + миграции)
mix setup

# Только миграции
mix ecto.migrate

# Сбросить и пересоздать БД
mix ecto.reset

# Сгенерировать TypeScript типы из Ash ресурсов
mix ash_typescript.codegen

# Запустить тесты
mix test

# Проверка перед коммитом (компиляция, форматирование, тесты)
mix precommit

# Запустить сервер
mix phx.server
```

---

## Конфигурация AshTypescript

```elixir
# config/config.exs
config :ash_typescript,
  output_file: "assets/js/ash_rpc.ts",
  run_endpoint: "/rpc/run",
  validate_endpoint: "/rpc/validate",
  input_field_formatter: :camel_case,
  output_field_formatter: :camel_case,
  generate_phx_channel_rpc_actions: true,
  generate_validation_functions: true
```

---

## База данных

По умолчанию подключается к PostgreSQL:

```
host:     localhost
port:     5431
database: handbooks_dev
username: postgres
password: admin21
```

Настраивается в `config/dev.exs`.

---

## Документация

- [`ARTICLE.md`](./ARTICLE.md) — подробный анализ AshTypescript: плюсы, минусы, сравнение с GraphQL, tRPC, REST и Phoenix LiveView
- [`AGENTS.md`](./AGENTS.md) — гайдлайны по коду для AI-агентов и разработчиков
