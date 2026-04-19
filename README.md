# Lendsqr Wallet Service

A demo MVP wallet service built with **Node.js + TypeScript + Knex + PostgreSQL**.

## Architecture

```
Controller → Service → Repository → Knex (PostgreSQL)
```

Layered architecture with a clear separation of concerns:

- **Controllers** — parse HTTP, delegate to services, return responses
- **Services** — business logic, transaction orchestration
- **Repositories** — data access layer (Knex queries)
- **Integrations** — Adjutor Karma blacklist client
- **Middleware** — auth, validation, error handling

## ERD

> **[View full ERD on dbdesigner.net](https://app.dbdesigner.net/)**

![Entity Relationship Diagram](./docs/erd.png)

### Table Descriptions

**`users`** — Core identity record. One user maps to exactly one wallet.

**`wallets`** — Holds the current balance in minor units (kobo). `balance_minor` is a BIGINT to avoid floating-point bugs. One-to-one with `users`.

**`transactions`** — Immutable ledger. Every balance change produces one or two rows:
- `FUND` / `WITHDRAW` → single row
- Transfer → two rows (`TRANSFER_DEBIT` on sender, `TRANSFER_CREDIT` on receiver) linked via `reference` / `related_reference`.

**`idempotency_keys`** — Stores request fingerprints to detect and replay duplicate submissions. Keyed by client-supplied idempotency key + operation type.

**`blacklist_checks`** — Audit log of every Adjutor Karma API call made during registration. Persisted regardless of outcome.

```
users (id PK, first_name, last_name, email UNIQUE, phone UNIQUE, password_hash)
  │
  ├── wallets (id PK, user_id FK UNIQUE, balance_minor BIGINT, currency)
  │     └── transactions (id PK, wallet_id FK, type ENUM, amount_minor,
  │                       balance_before_minor, balance_after_minor,
  │                       reference UNIQUE, related_reference)
  │
  └── idempotency_keys (id PK, key UNIQUE, operation, user_id FK,
                        request_hash, response_json, status ENUM)

blacklist_checks (id PK, user_email, user_phone, provider, is_blacklisted,
                  provider_response_json, checked_at)
```

## Setup

### Prerequisites
- Node.js 20+
- PostgreSQL 14+

### Install

```bash
npm install
cp .env.example .env
# Edit .env with your DB credentials and Adjutor API key
```

### Database

```bash
npm run migrate        # run all migrations
npm run migrate:rollback  # rollback last batch
npm run seed           # seed test users
```

### Run

```bash
npm run dev     # development with hot reload
npm run build   # compile TypeScript
npm start       # run compiled output
```

### Test

```bash
npm test                # run unit tests
npm run test:coverage   # with coverage report
```

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | HTTP port (default 3000) |
| `DATABASE_URL` | PostgreSQL connection string |
| `DB_SSL` | Enable SSL (`true`/`false`) |
| `ADJUTOR_BASE_URL` | Adjutor API base URL |
| `ADJUTOR_API_KEY` | Adjutor API key |
| `ADJUTOR_TIMEOUT_MS` | Adjutor request timeout (default 5000) |
| `JWT_SECRET` | Secret for faux token signing |

## API Endpoints

Base path: `/api/v1`

### Auth

| Method | Path | Description |
|---|---|---|
| POST | `/auth/register` | Register user + create wallet (karma check) |
| POST | `/auth/login` | Login, returns bearer token |

### Users

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/users/me` | ✓ | Profile + wallet snapshot |

### Wallet

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/wallet/balance` | ✓ | Current balance |
| POST | `/wallet/fund` | ✓ | Add funds |
| POST | `/wallet/withdraw` | ✓ | Withdraw funds |
| POST | `/wallet/transfer` | ✓ | Transfer to another user |
| GET | `/wallet/transactions` | ✓ | Transaction history |

### Health

```
GET /health → { "status": "ok" }
```

### Example Requests

**Register**
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Alice","last_name":"Test","email":"alice@test.com","password":"Password123!"}'
```

**Fund wallet**
```bash
curl -X POST http://localhost:3000/api/v1/wallet/fund \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000}'
```

**Transfer**
```bash
curl -X POST http://localhost:3000/api/v1/wallet/transfer \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"amount": 200, "receiver_email": "bob@test.com"}'
```

## Transaction Safety

All balance-mutating operations use:
1. `db.transaction()` — atomic DB transaction
2. `SELECT ... FOR UPDATE` — row-level locking
3. Deterministic lock ordering (by wallet ID) for transfers — prevents deadlocks

## Authentication

Faux bearer token: HMAC-SHA256 signed `userId.timestamp` encoded as base64. **Not production-grade** — documented limitation.

## Trade-offs & Future Improvements

- **Auth**: Replace faux token with proper JWT + refresh token lifecycle
- **Idempotency**: Full idempotency key table is migrated but not wired into endpoints — next step
- **Observability**: Add structured logging (pino) and request correlation IDs
- **Multi-currency**: Schema supports `currency` column; conversion logic not implemented
- **Integration tests**: Unit tests cover all business logic; DB integration tests require a test PostgreSQL instance
