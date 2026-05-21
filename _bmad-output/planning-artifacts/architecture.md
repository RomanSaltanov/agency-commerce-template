---
stepsCompleted: ['step-01-init', 'step-02-context', 'step-03-starter', 'step-04-decisions', 'step-05-patterns', 'step-06-structure', 'step-07-validation', 'step-08-complete']
workflowType: 'architecture'
lastStep: 8
status: 'complete'
completedAt: '2026-05-20'
inputDocuments: ['_bmad-output/planning-artifacts/prd.md', '_bmad-output/project-context.md']
workflowType: 'architecture'
project_name: 'agency-commerce-template'
user_name: 'Romansaltanov'
date: '2026-05-14'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements (43 total across 9 categories):**
- Catalog & Products (FR1–FR8): Full CRUD via Medusa Admin, image uploads to Cloudflare R2, draft/publish states, UAH pricing
- Multilingual & Localization (FR9–FR13): EN/UK URL-based routing, per-locale product fields, blank-on-empty behavior (no auto-fallback) — a deliberate product decision with deep architectural implications: blank-on-empty is a **display policy** (Admin UI: blank = informative for Tetiana; Storefront: blank = conversion killer for Sofiia). Content retrieval layer must enforce this boundary. DB column convention must be decided upfront: `NULL` for untranslated fields — enforced via migration template
- Cart & Checkout (FR14–FR20): Server-side cart persistence, guest + account checkout, Stripe with cart preservation on failure (5 distinct failure branches: timeout, requires_action 3DS, payment_failed, crash-after-charge, tab-close during redirect — each needs explicit handling), static delivery options list
- Customer Account (FR21–FR24): Registration at checkout, order history, address management, transactional email via Resend
- Order Management (FR25–FR27): Medusa Admin order list and detail view
- Compliance (FR28–FR32): UK GDPR cookie consent + Consent Mode v2, right-to-deletion (defined as **anonymization**: name/email/address → hashed or nulled, order records retained with customer_id → NULL — this is the GDPR-compliant AND legally safe path given 5–7 year order retention obligations under Ukrainian accounting law and EU VAT rules), legal pages (contacts, return policy, public offer)
- SEO (FR33–FR35): Server-generated metadata + Open Graph, dynamic sitemap with hreflang, robots.ts blocks staging. Note: blank-on-empty interacts with meta tags, JSON-LD structured data, and alt text — "blank" must mean element omitted, not empty string, for SEO and accessibility correctness
- Analytics (FR36–FR37): GA4 with conversion events, post-consent activation only
- Agency Operations & Figma Pipeline (FR38–FR43): Per-client provisioning script, full isolation, Figma MCP → React component generation, typed override layer, design token → Tailwind mapping. MCP output is layout source-of-truth; `.override.tsx` files must import base component prop types explicitly (`import type { Props } from "./generated-component"`) so tsc breaks on MCP rerun if interface changes — this is the enforcement path for the typed contract

**Non-Functional Requirements:**
- Performance: Core Web Vitals green zone (LCP <2.5s, CLS <0.1, INP <200ms); mobile 4G <3s page load. **Must be enforced by Lighthouse CI gate in deployment pipeline** — prose NFR without automated gate is not a constraint
- Security: HTTPS only, no card data proxied, per-client DB isolation, secrets in env vars only
- Scalability: 1 Hetzner CX32 (4 vCPU/8GB) supports ≤5 Medusa instances. **Requires explicit Docker Compose CPU/memory limits per container** — default Docker Compose provides no isolation; one flash-sale client can starve others. MikroORM pool config must be bounded (`pool: { min: 1, max: 5 }`) — default pool exhausts RAM at 5 instances
- Accessibility: WCAG 2.1 AA for core flows; JS-free rendering for SEO pages
- Reliability: Stripe webhook ≤30s (p95 — must be an automated CI assertion, not prose); no duplicate charge on reconnect (requires idempotency key storage + replay test); structured JSON error logging per instance

**Scale & Complexity:**
- Primary domain: Full-stack headless e-commerce (Medusa v2 backend + Next.js App Router storefront)
- Complexity level: Medium
- Estimated architectural components: 8 (backend, storefront, media, email, payments, analytics, provisioning script, Figma MCP pipeline)
- Team: 1 developer + 1 designer

### Technical Constraints & Dependencies

- **Deployment split is non-negotiable:** Medusa v2 runs as a long-running Node.js process — incompatible with Vercel serverless. Backend → Hetzner VPS (Docker Compose with explicit resource limits); Storefront → Vercel
- **Fork model, not npm dependency:** Each client is a full repo fork. Template updates are manual cherry-picks. The canonical template repo must be treated as a true upstream with a documented sync process (even if just `git merge upstream/main`). Without this, security patches require N manual PRs — manageable at 3 clients, a liability at 10+
- **Medusa v2.15.2 monorepo constraints:** All framework imports via re-export paths (`@medusajs/framework/*`), not direct packages. Zod 4.2.0 via `@medusajs/framework/zod` ONLY — direct `import { z } from "zod"` resolves a different transitive version, fails at runtime not compile time. Enforce via ESLint `no-restricted-imports` on bare `"zod"` before first fork
- **ORM:** MikroORM 6.x + PostgreSQL exclusively — no SQLite fallback, Node ≥20 required
- **Per-client isolation:** Separate PostgreSQL DB, Medusa backend, Next.js storefront, Stripe key + webhook endpoint, **per-client Cloudflare R2 bucket** (not shared bucket with prefixes — per-client buckets give clear billing attribution, simple offboarding, and eliminate prefix traversal risk)
- **Media:** Cloudflare R2 (S3-compatible), accessed via Medusa File Provider, per-client bucket
- **Email:** Resend via Medusa Notification Provider — locale-aware templates that are **legally structured documents** (Ukrainian distance-selling law requires: itemized goods, price including VAT, delivery terms, cancellation rights, seller legal details — template must be field-complete, not just "sends an email")
- **Analytics:** GA4 with Consent Mode v2 — events fire only post-consent; `next/script strategy="afterInteractive"`
- **Figma MCP pipeline:** MCP output is layout source-of-truth; rendering fixes live in colocated `.override.tsx` with explicit prop type import from generated file — enforces compile-time safety on MCP reruns. The pipeline should always produce a PR for human review, never a direct commit

### Architectural Decisions Required Before Implementation

The following are **blocking decisions** — they have schema or component architecture consequences that cannot be cleanly retrofitted:

1. **GDPR deletion model = anonymization** (not hard-delete): Order records retained with `customer_id → NULL`, PII fields hashed or nulled. Schema must support this from v1. A **deletion registry pattern** is required: any new integration storing PII must register a deletion handler — enforced as a CI gate — or it cannot be merged. This makes Phase 2 integrations (WayForPay, Nova Poshta) inherently auditable.

2. **Blank-on-empty = element omitted, not empty string**: Applies to all renderable surfaces including meta tags, JSON-LD, alt text, breadcrumbs. DB stores `NULL` (not `""`). Content retrieval layer must distinguish "not translated" from "translated to empty."

3. **Checkout payment provider extensibility**: Checkout UI must accept a list of payment providers (not hardcoded to Stripe) to avoid a storefront redesign when WayForPay is added in Phase 2. This is a 2-hour architecture decision now vs. a 2-week refactor later.

4. **Workflow ID namespace convention**: Fork model risks silent ID collision (`createWorkflow("update-order")` in a client fork silently overrides base). Convention: `{domain}-{verb}-{noun}` for template workflows; client-specific overrides use `{client-slug}/{domain}-{verb}-{noun}`. Enforced by CI lint rule.

### Cross-Cutting Concerns Identified

1. **Internationalization (i18n):** URL-segment routing (`/[locale]/`), per-locale content fields in Medusa, `useTranslation()` in all UI strings, `hreflang` in sitemap — touches every layer. Blank-on-empty display policy must be consistently enforced across all rendering surfaces including meta/SEO fields
2. **Authentication & Authorization:** Medusa Admin RBAC (out-of-box v2); storefront customer auth; guest vs. authenticated checkout flows; Checkout UI must support provider list for Phase 2 extensibility
3. **GDPR / Compliance:** Cookie consent gates analytics activation; deletion = anonymization (schema constraint from day 1); deletion registry pattern as CI gate; order confirmation email is a legally structured document; right-to-deletion cascades across DB, file storage, Stripe, and analytics sinks
4. **Per-Client Isolation:** Per-client R2 buckets (not prefixes); Docker Compose resource limits (CPU/memory per container); MikroORM pool bounds; tenant isolation test required in CI
5. **SEO:** Server-side rendering constraints (SSR/ISR, `generateMetadata()`, no client-only data fetching for indexable pages); blank-on-empty = element omitted for all SEO fields; Lighthouse CI gate enforces Core Web Vitals NFR
6. **Error Handling & Observability:** Structured JSON logs with standard fields (`client_id`, `request_id`, `level`, `service`) — format defined now, aggregation added before client 4; structured log format enforced by CI gate (zero non-JSON stdout lines)
7. **Figma MCP Override Layer:** `.override.tsx` files import base prop types explicitly; MCP pipeline output always goes through PR review; snapshot tests keyed by Figma node ID verify override regression on reruns
8. **Fork Upstream Sync:** Canonical template treated as git upstream; documented sync process defined before second client fork; template version tracked per client instance

## Starter Template Evaluation

### Primary Technology Domain

Full-stack headless e-commerce: Medusa v2 backend + Next.js storefront.

### Selected Starter: `medusajs/nextjs-starter-medusa`

**Repo:** https://github.com/medusajs/nextjs-starter-medusa

**Rationale:** Официальный стартер Medusa v2 — содержит все необходимые commerce страницы (PDP, PLP, cart, checkout, account), интеграцию со Stripe, Server Components, `generateMetadata()` на всех страницах. Нет смысла собирать с нуля то, что уже есть и поддерживается командой Medusa.

**Initialization Command:**

```bash
git clone https://github.com/medusajs/nextjs-starter-medusa.git storefront
cd storefront && yarn install
cp .env.template .env.local
# Задать NEXT_PUBLIC_MEDUSA_BACKEND_URL, NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
- Next.js 15.3.9, App Router, TypeScript ^5.3.2
- `@medusajs/js-sdk` (latest) — единственный способ общения с бэкендом

**Styling Solution:**
- Tailwind CSS ^3.0.23

**Build Tooling:**
- Next.js built-in (Turbopack в dev режиме)

**State Management:**
- React Context (cart) + Server Components + URL state — без Redux/Zustand

**Code Organization:**
- `src/app/[countryCode]/` — dynamic segment для роутинга
- `src/lib/data/` — server-side data fetching функции
- `src/modules/` — UI компоненты по доменам (products, cart, checkout, account, layout)

**Development Experience:**
- `MEDUSA_FF_TRANSLATION=true` — включает translation модуль на бэкенде (v2.12.3+)

### Locale & Region Architecture Decision

**Проблема:** стартер использует `[countryCode]` в URL для Medusa regions (валюта/налоги), а язык — через cookie `_medusa_locale`. Для нашего проекта нужен язык в URL (SEO: hreflang, Googlebot, Vercel edge cache).

**Принятое решение — Вариант 2: locale в URL, регион в cookie:**

| Измерение | Механизм | Storage | SEO |
|---|---|---|---|
| Язык контента | `/[locale]/` в URL | URL path | ✓ hreflang |
| Регион/валюта | cookie + UI switcher | `_medusa_region` cookie | не нужен |

**Реализация:**
- Переименовать `[countryCode]` → `[locale]` в `src/app/`
- Middleware читает locale из URL → шлёт `x-medusa-locale: uk` header на бэкенд
- Medusa `translation` модуль применяет переводы к продуктам/категориям автоматически
- `CountrySelect` компонент в футере переключает регион через cookie независимо от языка
- Язык и регион полностью независимы: `/en/` + UAH = английский интерфейс, гривна

**MVP:** один регион (Украина/UAH) — `CountrySelect` скрыт, `DEFAULT_REGION=ua` в env

**Growth path:** включить `CountrySelect` UI когда появится второй регион; при необходимости полной SEO-адресуемости регионов — мигрировать к `/[locale]/[countryCode]/`

**Note:** Project initialization (clone + configure storefront) should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Locale в URL (`/[locale]/`), регион в cookie — блокирует структуру роутинга
- Docker Compose с resource limits — блокирует provisioning script
- Migrations перед стартом (`medusa db:migrate` до `medusa start`) — блокирует деплой pipeline

**Important Decisions (Shape Architecture):**
- CI/CD: GitHub Actions → SSH → Docker Compose per-client
- Secrets management: `.env` файлы на сервере per-client
- ESLint rules: `no-restricted-imports` + workflow ID namespace

**Deferred Decisions (Post-MVP):**
- Redis для кэширования (сейчас Next.js `force-cache` + `revalidateTag`)
- CountrySelect UI switcher (сейчас `DEFAULT_REGION=ua` в env)
- Централизованный мониторинг (до клиента 4)

### Data Architecture

- **Database:** PostgreSQL, отдельная БД per-client
- **ORM:** MikroORM 6.x, pool `{ min: 1, max: 5 }` — обязательно, иначе 5 инстансов исчерпают RAM
- **Migrations:** `npx medusa db:migrate` перед каждым `medusa start` — safe to run even with no pending migrations
- **Translations:** Medusa `translation` модуль (v2.12.3+), включается через `MEDUSA_FF_TRANSLATION=true`. Отдельная таблица `translation` с полями `reference_id`, `reference`, `locale_code` (BCP 47), `translations` (JSON). Locale в запрос: `x-medusa-locale` header или `?locale=` query param.
- **Caching:** Next.js `force-cache` + `revalidateTag()` на фронте. Redis — post-MVP.
- **GDPR deletion:** anonymization (не hard-delete). `customer_id → NULL`, PII хешируется/обнуляется, order records сохраняются.

### Authentication & Security

- **Admin auth:** Medusa built-in RBAC (out-of-box v2), кастомных ролей нет в MVP
- **Customer auth:** Medusa built-in (login, register, account pages в стартере)
- **Payments:** Stripe через Medusa Payment Provider. Raw card data не проходит через серверы — только Stripe.js tokenization
- **Secrets:** `.env` файлы на сервере в `/opt/clients/{client-name}/.env`, не в репозитории. GitHub Actions хранит только SSH ключ деплоя.
- **Per-client isolation:** отдельный PostgreSQL DB, отдельный Docker Compose stack, отдельный Stripe key + webhook endpoint, отдельный Cloudflare R2 bucket

### API & Communication Patterns

- **Storefront → Backend:** `@medusajs/js-sdk` (единственный способ, не прямые fetch)
- **Locale передача:** `x-medusa-locale: {locale}` header на каждый запрос (читается из URL сегмента middleware'ом фронта)
- **Framework imports:** только через re-export пути (`@medusajs/framework/*`). Bare `"zod"` запрещён — только `@medusajs/framework/zod`. Enforcement: ESLint `no-restricted-imports`.
- **Workflow ID namespace:** `{domain}-{verb}-{noun}` для template workflows; `{client-slug}/{domain}-{verb}-{noun}` для client-specific overrides. Enforcement: CI lint rule.
- **Error handling:** `MedusaError` для всех ошибок в сервисах и workflow steps
- **Logging:** structured JSON per-instance (`client_id`, `request_id`, `level`, `service`)

### Frontend Architecture

- **Routing:** `src/app/[locale]/` — переименован с `[countryCode]`. Middleware читает locale из URL → `x-medusa-locale` header.
- **Region:** cookie `_medusa_region`. MVP: захардкожен `DEFAULT_REGION=ua` в env, CountrySelect скрыт.
- **State management:** React Context (cart) + Server Components + URL state. Без Redux/Zustand.
- **i18n UI strings:** `next-intl` или аналог — решение в step-05 patterns
- **SEO:** `generateMetadata()` на всех страницах, `app/sitemap.ts` с `hreflang`, `app/robots.ts` блокирует staging, `next/image` с `sizes` и `priority` для hero
- **Analytics:** GA4, `next/script strategy="afterInteractive"`, активация только после cookie consent
- **Figma MCP pipeline:** MCP output → layout source of truth; `.override.tsx` с explicit prop type import → compile-time safety; всегда через PR, никогда direct commit

### Infrastructure & Deployment

- **Storefront:** Vercel (push to git → auto deploy per-client project)
- **Backend:** Hetzner VPS, Docker Compose per-client stack с explicit CPU/memory limits
- **CI/CD Backend:** GitHub Actions → `appleboy/ssh-action` → SSH на Hetzner → `docker compose pull && docker compose up -d`
- **Deploy sequence:** `yarn build` → `npx medusa db:migrate` → `docker compose up -d`
- **Media:** Cloudflare R2, per-client bucket (не shared з префіксами)
- **Email:** Resend через Medusa Notification Provider
- **MVP observability:** SSH + structured JSON logs per-instance. Централізований агрегатор до клієнта 4.

### Decision Impact Analysis

**Implementation Sequence:**
1. Dockerfile + Docker Compose base template (блокирує всі backend stories)
2. Storefront locale routing (`[locale]` сегмент + middleware) (блокирує всі frontend stories)
3. `MEDUSA_FF_TRANSLATION=true` + translation module setup (блокирує multilingual content)
4. GitHub Actions deploy workflow (блокирує staging → production pipeline)
5. Provisioning script (блокирує onboarding другого клієнта)

**Cross-Component Dependencies:**
- Locale в URL → middleware → `x-medusa-locale` header → translation module → translated product content
- Docker Compose resource limits → MikroORM pool bounds → стабільність при 5 інстансах
- GDPR deletion handler registry → будь-яка нова інтеграція з PII (WayForPay, Nova Poshta) не може бути змержена без deletion handler

## Implementation Patterns & Consistency Rules

### Naming Patterns

**Locale code format — short BCP 47:**
- В URL: `/uk/`, `/en/`
- В БД (`translation.locale_code`): `"uk"`, `"en"`
- В `x-medusa-locale` header: `"uk"`, `"en"`
- В `hreflang`: `hreflang="uk"`, `hreflang="en"`
- НЕ `uk-UA`, НЕ `en-US` — тільки короткий код скрізь

**Workflow ID namespace:**
- Template workflows: `{domain}-{verb}-{noun}` → `product-sync-catalog`
- Client-specific overrides: `{client-slug}/{domain}-{verb}-{noun}` → `perfume/product-sync-catalog`
- НЕ використовувати імена що збігаються з Medusa core workflows (`update-order`, `create-cart` і т.д.)

**File naming:**
- Компоненти: `kebab-case.tsx` → `product-card.tsx`
- MCP generated: `product-card.tsx` (не редагувати вручну)
- MCP override: `product-card.override.tsx` (поруч з generated)

### Structure Patterns

**Data fetching — explicit locale param:**
```typescript
// ПРАВИЛЬНО — locale як явний параметр
export const getProduct = async (handle: string, locale: string) => {
  return sdk.store.products.retrieve(handle, {}, { "x-medusa-locale": locale })
}

// Page component передає locale з params
export default async function ProductPage({ params }) {
  const { locale, handle } = await params
  const product = await getProduct(handle, locale)
}

// НЕПРАВИЛЬНО — locale прихований всередині функції
export const getProduct = async (handle: string) => {
  const locale = await getLocale() // не робити так
}
```

**Data fetching file structure:**
```
src/lib/data/
  products.ts       ← getProduct(handle, locale), listProducts(params, locale)
  cart.ts           ← getCart(), addToCart()
  customer.ts       ← getCustomer()
  collections.ts    ← getCollection(handle, locale)
  locale-actions.ts ← getLocale(), setLocaleCookie() (тільки для cookie механізму)
```

**Server vs Client components:**
```typescript
// Default: Server Component — data fetching, SEO, rendering
// src/modules/products/templates/product-template.tsx
export default async function ProductTemplate({ handle, locale }) {
  const product = await getProduct(handle, locale)
}

// "use client" ТІЛЬКИ для: onClick, useState, useEffect, browser API
// Naming hint: *-actions.tsx, *-form.tsx, *-interactive.tsx
```

**Figma MCP override pattern:**
```
src/modules/products/components/
  product-card.tsx           ← MCP generated — НЕ редагувати вручну
  product-card.override.tsx  ← ручні правки

// product-card.override.tsx — ОБОВ'ЯЗКОВО explicit prop type import:
import type { Props } from "./product-card"
// tsc зламається при MCP rerun якщо інтерфейс змінився — це enforcement path
```

### Infrastructure Patterns

**Secrets per-client на сервері:**
```
/opt/clients/
  {client-name}/.env   ← DATABASE_URL, STRIPE_SECRET_KEY, RESEND_API_KEY, ...
```
GitHub Actions зберігає тільки SSH ключ деплоя. Ніяких секретів в репозиторії.

**Docker Compose resource limits (обов'язково для кожного клієнта):**
```yaml
services:
  medusa:
    deploy:
      resources:
        limits:
          cpus: '0.75'
          memory: 1536M
```
Без лімітів один клієнт при flash-sale вб'є інших на тому ж VPS.

**MikroORM pool (обов'язково):**
```typescript
pool: { min: 1, max: 5 }
// Default pool виснажує RAM при 5 інстансах
```

### Process Patterns

**Error handling:**
```typescript
// Backend: завжди MedusaError
throw new MedusaError(MedusaError.Types.NOT_FOUND, `Product ${handle} not found`)

// Frontend: user-facing повідомлення без технічних деталей
// "Your card was declined. Please check your card details." — не stack trace
```

**Deploy sequence (незмінний порядок):**
```bash
yarn build
npx medusa db:migrate   # завжди перед start, навіть якщо немає pending migrations
docker compose up -d
```

### Enforcement Guidelines

**All AI Agents MUST:**
- Передавати `locale` як явний параметр у всі data-fetching функції
- Використовувати `@medusajs/framework/zod` — ніколи bare `"zod"`
- Імпортувати тільки через `@medusajs/framework/*` re-export paths
- Додавати `import type { Props } from "./component"` в кожен `.override.tsx`
- Використовувати `MedusaError` для всіх помилок в сервісах і workflow steps
- Дотримуватись workflow ID namespace convention

**Anti-patterns:**
- `import { z } from "zod"` → використовувати `@medusajs/framework/zod`
- Читати locale всередині data функції через cookie → передавати як параметр
- Редагувати MCP generated файли вручну → використовувати `.override.tsx`
- `createWorkflow("update-order")` без namespace → конфлікт з Medusa core

## Project Structure & Boundaries

### Repository Structure

Монорепо — `backend/` і `storefront/` в одному репозиторії. При форку для клієнта — все в одному місці, один PR для cross-stack змін.

```
agency-commerce-template/          ← canonical template repo
├── backend/                       ← Medusa v2
│   ├── src/
│   │   ├── api/                   ← кастомні API routes
│   │   ├── modules/               ← кастомні Medusa modules
│   │   ├── workflows/             ← {domain}-{verb}-{noun}.ts
│   │   ├── subscribers/           ← event subscribers
│   │   └── jobs/                  ← scheduled jobs
│   ├── .env.template
│   ├── Dockerfile
│   ├── docker-compose.yml         ← з resource limits per container
│   ├── medusa-config.ts
│   └── package.json
│
├── storefront/                    ← Next.js 15 (клон nextjs-starter-medusa)
│   ├── src/
│   │   ├── app/
│   │   │   ├── [locale]/          ← перейменовано з [countryCode]
│   │   │   │   ├── (main)/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── products/[handle]/page.tsx
│   │   │   │   │   ├── collections/[handle]/page.tsx
│   │   │   │   │   ├── categories/[...category]/page.tsx
│   │   │   │   │   ├── cart/page.tsx
│   │   │   │   │   ├── store/page.tsx
│   │   │   │   │   └── account/
│   │   │   │   └── (checkout)/checkout/page.tsx
│   │   │   ├── sitemap.ts         ← з hreflang per locale
│   │   │   └── robots.ts          ← блокує staging
│   │   ├── lib/
│   │   │   ├── data/
│   │   │   │   ├── products.ts    ← getProduct(handle, locale)
│   │   │   │   ├── collections.ts ← getCollection(handle, locale)
│   │   │   │   ├── categories.ts  ← getCategories(locale)
│   │   │   │   ├── cart.ts
│   │   │   │   ├── customer.ts
│   │   │   │   ├── locales.ts     ← listLocales() → /store/locales
│   │   │   │   └── locale-actions.ts
│   │   │   └── config.ts
│   │   ├── modules/
│   │   │   ├── products/
│   │   │   │   └── components/
│   │   │   │       ├── product-card.tsx          ← MCP generated
│   │   │   │       └── product-card.override.tsx ← ручні правки
│   │   │   ├── cart/
│   │   │   ├── checkout/
│   │   │   ├── account/
│   │   │   └── layout/
│   │   │       ├── templates/nav/
│   │   │       └── templates/footer/
│   │   └── middleware.ts          ← locale з URL → x-medusa-locale header
│   ├── .env.template
│   └── package.json
│
├── scripts/
│   └── provision-client.sh        ← новий клієнт: DB + backend + storefront + Stripe
│
├── .github/
│   └── workflows/
│       ├── deploy-backend.yml     ← SSH → Hetzner → docker compose up
│       └── lint.yml               ← ESLint + tsc
│
└── docs/
    ├── provisioning.md
    └── figma-mcp-workflow.md
```

### Architectural Boundaries

**API Boundaries:**
- Storefront → Backend: тільки через `@medusajs/js-sdk`, не прямі fetch
- Backend store API: `/store/*` — публічні endpoints для storefront
- Backend admin API: `/admin/*` — тільки для Medusa Admin UI, захищені
- Кастомні endpoints: `/store/locales` (повертає доступні locales)

**Data Boundaries:**
- Кожен клієнт: окрема PostgreSQL DB → cross-client data access неможливий
- Translation module: `translation` таблиця per-DB, locale_code = `"uk"` / `"en"`
- Media: окремий Cloudflare R2 bucket per-client
- Stripe: окремий restricted key + webhook endpoint per-client

**Locale Data Flow:**
```
URL /uk/products/bloom → middleware → x-medusa-locale: uk → Medusa API
→ translation module → translated product fields → storefront render
```

### Requirements to Structure Mapping

| FR Category | Location |
|---|---|
| Каталог і товари (FR1–FR8) | `storefront/src/modules/products/`, `storefront/src/app/[locale]/(main)/products/` |
| Мультиязычність (FR9–FR13) | `storefront/src/middleware.ts`, `storefront/src/lib/data/locale-actions.ts`, `backend/` translation module |
| Корзина і checkout (FR14–FR20) | `storefront/src/modules/cart/`, `storefront/src/modules/checkout/` |
| Аккаунт покупця (FR21–FR24) | `storefront/src/modules/account/`, `storefront/src/app/[locale]/(main)/account/` |
| Управління замовленнями (FR25–FR27) | Medusa Admin (out-of-box) |
| Compliance / GDPR (FR28–FR32) | `storefront/src/modules/layout/` (cookie banner), `backend/src/workflows/` (deletion) |
| SEO (FR33–FR35) | `storefront/src/app/sitemap.ts`, `storefront/src/app/robots.ts`, `generateMetadata()` в page.tsx |
| Аналітика (FR36–FR37) | `storefront/src/modules/layout/` (GA4 script) |
| Agency Ops / Provisioning (FR38–FR40) | `scripts/provision-client.sh`, `backend/docker-compose.yml` |
| Figma MCP pipeline (FR41–FR43) | `storefront/src/modules/*/components/*.override.tsx` |

### i18n UI Strings — next-intl (доповнення до step-06)

**Прийнято:** `next-intl` для перекладу статичних рядків інтерфейсу.

Translation module Medusa покриває **контент продуктів** (назви, описи, категорії).  
`next-intl` покриває **UI strings** (`"Add to cart"`, `"Checkout"`, `"My account"` тощо).

```
storefront/
├── messages/
│   ├── uk.json        ← { "cart": { "add": "Додати до кошика" } }
│   └── en.json        ← { "cart": { "add": "Add to cart" } }
├── src/
│   ├── i18n/
│   │   ├── routing.ts ← locales: ['uk', 'en'], defaultLocale: 'uk'
│   │   └── request.ts ← getRequestConfig → завантажує messages per locale
│   └── middleware.ts  ← next-intl middleware (locale з URL) + x-medusa-locale header
```

**Використання в компонентах:**
```typescript
// Server Component
import { getTranslations } from "next-intl/server"
const t = await getTranslations("cart")
<button>{t("add")}</button>

// Client Component
import { useTranslations } from "next-intl"
const t = useTranslations("cart")
```

**Middleware об'єднання:** next-intl middleware обробляє locale routing + окремо шле `x-medusa-locale` на бекенд через `getLocaleHeader()`.

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:** Всі технологічні вибори сумісні без конфліктів:
- Next.js 15 App Router + `@medusajs/js-sdk` — офіційна комбінація стартера
- `next-intl` + `/[locale]/` routing — нативна інтеграція, без конфліктів з App Router
- Locale в URL → `x-medusa-locale` header → translation module — чистий односпрямований data flow
- Docker Compose resource limits + MikroORM pool bounds — взаємно підсилюють ізоляцію між клієнтами

**Pattern Consistency:** Всі патерни узгоджені:
- Explicit locale param скрізь в `lib/data/` → консистентно і тестабельно
- `.override.tsx` з explicit prop type import → compile-time safety на MCP reruns
- Workflow ID namespace → унеможливлює конфлікти при форку

**Structure Alignment:** Структура монорепо підтримує всі рішення — один PR для cross-stack змін, спільний provisioning script.

### Requirements Coverage Validation ✅

**Functional Requirements (43 FR):** Всі покриті — детальний маппінг в розділі "Requirements to Structure Mapping".

**Non-Functional Requirements:**
- NFR1–NFR3 (performance): `next/image` з `sizes`/`priority`, ISR, Lighthouse CI gate
- NFR5–NFR10 (security): HTTPS only, no card proxy, per-client DB, secrets в env
- NFR11–NFR12 (scalability): Docker resource limits per container, MikroORM pool `{min:1, max:5}`
- NFR14–NFR15 (accessibility): WCAG 2.1 AA, JS-free rendering через SSR/Server Components
- NFR16–NFR17 (reliability): Stripe webhook idempotency, ≤30s CI assertion, structured JSON logs

### Gap Analysis Results

**Gaps виявлено і закрито:**
- ✅ i18n UI strings — вирішено через `next-intl` (додано в step-06 structure)

**Known deferred (не gaps, свідомі рішення):**
- Redis кешування — post-MVP, поточний Next.js cache достатній
- CountrySelect UI — прихований в MVP, один регион
- Централізований моніторинг — до клієнта 4
- WayForPay provider — Growth phase

### Architecture Completeness Checklist

**Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed (Medium, 1 dev + 1 designer)
- [x] Technical constraints identified (Vercel serverless incompatibility, MikroORM only, Node ≥20)
- [x] Cross-cutting concerns mapped (i18n, auth, GDPR, SEO, per-client isolation, Figma MCP)

**Architectural Decisions**
- [x] Critical decisions documented with versions (Next.js 15.3.9, Tailwind ^3.0.23, TS ^5.3.2)
- [x] Technology stack fully specified (Medusa v2, Next.js 15, PostgreSQL, MikroORM 6.x)
- [x] Integration patterns defined (SDK-only, x-medusa-locale, Stripe/Resend/R2 via Medusa providers)
- [x] Performance considerations addressed (Lighthouse CI, next/image, ISR, pool bounds)

**Implementation Patterns**
- [x] Naming conventions established (locale codes, workflow IDs, file names)
- [x] Structure patterns defined (explicit locale param, Server/Client component split)
- [x] Communication patterns specified (x-medusa-locale header, SDK-only)
- [x] Process patterns documented (error handling, deploy sequence, MCP override)

**Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established (store API vs admin API, per-client isolation)
- [x] Integration points mapped (locale flow, Stripe/Resend/R2)
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High

**Key Strengths:**
- Чіткий locale data flow без двозначностей (URL → header → translation module)
- Blocking architectural decisions прийняті до першого рядка коду (GDPR deletion model, blank-on-empty, payment provider extensibility, workflow namespace)
- Per-client ізоляція на всіх рівнях (DB, Docker, Stripe, R2)
- MCP override layer з compile-time safety — унікальний для цього проекту

**Areas for Future Enhancement:**
- Redis для кешування при зростанні трафіку
- Централізований log aggregation (Grafana/Loki) до клієнта 4
- IETF locale tags (`/uk-UA/`) якщо знадобиться повна SEO-адресуємість регіонів

### Implementation Handoff

**AI Agent Guidelines:**
- Дотримуватись всіх рішень точно як задокументовано
- Explicit locale param у всіх `lib/data/` функціях — без виключень
- `"use client"` тільки для інтерактивних компонентів
- Ніколи не редагувати MCP generated файли — тільки `.override.tsx`
- Всі помилки через `MedusaError`, всі Zod imports через `@medusajs/framework/zod`

**First Implementation Priority:**
1. `git clone nextjs-starter-medusa storefront` + rename `[countryCode]` → `[locale]`
2. `yarn add next-intl` + налаштування middleware і routing
3. Dockerfile + docker-compose.yml для backend з resource limits
4. GitHub Actions deploy workflow
