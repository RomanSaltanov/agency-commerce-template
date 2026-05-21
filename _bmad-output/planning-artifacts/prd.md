---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-02b-vision', 'step-02c-executive-summary', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish']
releaseMode: phased
inputDocuments: ['_bmad-output/project-context.md']
workflowType: 'prd'
classification:
  projectType: 'saas_b2b'
  domain: 'e-commerce'
  complexity: 'medium'
  projectContext: 'brownfield'
  subtype: 'agency_platform'
  deliveryModel: 'per-client-instance'
  storefront: 'next.js'
  i18n: ['en', 'uk', 'ru']
---

# Product Requirements Document — Agency Commerce Platform

**Author:** Romansaltanov
**Date:** 2026-05-14

## Executive Summary

Agency Commerce Platform — производственная платформа для веб-агентства по созданию кастомных B2C e-commerce решений на базе Medusa v2 + Next.js. Задача платформы: запускать уникальные интернет-магазины быстро, с полным контролем над стеком и без зависимости от WordPress/WooCommerce.

**Целевые пользователи:**
- Разработчик агентства — создаёт и деплоит клиентские магазины на основе шаблона
- Дизайнер агентства — создаёт уникальный UI в Figma, переносится в код через Figma MCP
- Владелец магазина (клиент агентства) — управляет товарами и заказами через Medusa Admin

**Проблема:** WordPress/WooCommerce магазины шаблонны, ограничены плагинами, требуют vendor lock-in. Агентство хочет предлагать уникальные решения и полностью контролировать инфраструктуру.

**Ключевые дифференциаторы:**
- **Figma → storefront как основной путь:** дизайнер работает в Figma — Figma MCP генерирует Next.js компоненты. Каждый магазин выглядит как кастомный продукт, не шаблон.
- **Полный контроль над стеком:** Medusa v2 headless backend, нет зависимости от плагинов и сторонних платформ.
- **Per-client isolation:** каждый клиент — отдельный Medusa backend + Next.js storefront, изолированные данные и деплои.
- **Мультиязычность из коробки:** EN/UK/RU на уровне контента и UI; поддержка сценария "один язык".

## Success Criteria

### User Success

**Разработчик агентства:**
- Новый клиентский магазин поднят и задеплоен за 2–3 рабочих дня на основе готового Figma-дизайна
- Процесс не требует boilerplate с нуля — всё из шаблона платформы

**Дизайнер агентства:**
- Figma-макет конвертируется в Next.js компоненты через MCP без значительной ручной правки
- Клиент принимает внешний вид магазина с первой-второй итерации

**Владелец магазина:**
- Магазин работает: товары отображаются, корзина и checkout функционируют, платёж проходит
- Клиент самостоятельно управляет каталогом через Medusa Admin без привлечения разработчика

### Business Success

- Первый тестовый магазин (парфюмерия) запущен в production
- Второй клиентский магазин запущен быстрее первого — платформа подтверждает повторяемость
- Время от получения дизайна до live-магазина: ≤ 5 рабочих дней

### Technical Success

- Per-client изоляция: отдельный backend + storefront на клиента
- Мультиязычность EN/UK/RU на уровне UI и контента; поддержка сценария "один язык"
- Stripe checkout проходит end-to-end в production
- Core Web Vitals storefront в зелёной зоне

### Measurable Outcomes

| Метрика | MVP | Growth |
|---|---|---|
| Время запуска нового магазина | ≤ 5 дней | ≤ 2 дней |
| Figma → компонент (ручная правка) | < 30% | < 10% |
| Живых клиентских магазинов | 1 | 3+ |
| Языков из коробки | 1–3 (EN/UK/RU) | + любой |

## User Journeys

### Journey 1: Agency Developer — Launching a New Client Shop

**Meet Andriy**, senior developer at the agency. A new client — a Kyiv-based perfume brand — just signed the contract. The designer has a Figma mockup ready. Andriy has one week.

**Opening Scene:** Andriy clones the platform template. He's done this setup from scratch three times before and hated every hour of it. But this time there's a moment of risk he can't skip: he's betting his delivery timeline on a template he hasn't fully stress-tested for this client's stack. He runs the setup script and watches the output carefully — any failure here costs him a day.

**Rising Action:** The script succeeds. He spins up a new Medusa backend instance for this client, sets environment variables (Stripe keys, DB connection, storefront URL), runs migrations. The Next.js storefront is templated — pages already exist for catalog, product, cart, checkout, and account. He updates the API endpoint in storefront config. He maps Olena's Figma design tokens to the Tailwind config — this mapping step is a one-time setup he does before she starts handing off components.

**Climax:** The designer shares the Figma node ID. Andriy runs Figma MCP, which reads the Figma API and writes a React component file into the Next.js project. Output is ~70% accurate — layout and colors are correct, a few props need wiring to real data, and a Cyrillic font weight needs a CSS override. He decides: keep the manual fix as a local override file (colocated `.override.tsx`), not a Figma feedback loop. Overrides use TypeScript-typed interface so renames in MCP output are caught at compile time. He wires the real product data, adds the override, tests in browser.

**Resolution:** On day 3, the shop is live in staging. The client clicks through, orders a test perfume, gets a Stripe confirmation. Andriy deploys to production after client approval. The remaining 30% of components (those with complex interactions) he builds by hand — estimated 1–2 days. Total: 4–5 days from template clone to production.

**Journey Capabilities Revealed:** Template scaffolding + setup script, per-client env config, Figma design token → Tailwind mapping (one-time setup), Figma MCP component generation (reads Figma API → writes local React file), typed override layer, Stripe sandbox testing, staging → production deploy pipeline.

---

### Journey 2: Agency Designer — Figma to Storefront Component

**Meet Olena**, the agency's product designer. Her job: make the perfumery shop look nothing like WooCommerce.

**Opening Scene:** She finishes the product card in Figma — large fragrance photo, EN/UK name, price in UAH, cream-gold "Add to cart" button. She annotates with design tokens (color variables, spacing scale) and adds a note: "hover — subtle border glow." She knows Andriy has already mapped her token set to the Tailwind config as part of setup.

**Rising Action:** She pings Andriy with the node ID. He runs Figma MCP. The component comes out close — layout correct, tokens resolved. The hover note appears as a comment in the file. But the Ukrainian product name has wrong font weight. This is the moment of handoff negotiation: does Olena fix in Figma and Andriy reruns MCP (risking overwrite of manual edits), or does Andriy own a CSS override? They agree on the protocol: **MCP output is source of truth for layout; rendering fixes live in a colocated `.override.tsx` file with a typed interface that survives reruns without being overwritten.**

**Resolution:** Olena reviews in browser — approves in 10 minutes. The product card is in the codebase. The client says "this actually looks like our brand."

**Journey Capabilities Revealed:** Figma MCP pipeline with typed override layer (layout from MCP, rendering fixes in `.override.tsx`), design token mapping, Cyrillic rendering, designer review loop.

---

### Journey 3: Store Owner — Managing the Catalog

**Meet Tetiana**, owner of the perfumery brand. Not technical. If she can post to Instagram, she can manage a shop.

**Opening Scene:** The shop is live. Andriy sends her the Medusa Admin URL and login. She has 40 products — she brought a spreadsheet. There's no CSV import in MVP, so she enters manually: title in Ukrainian (UK field), switches to EN tab, enters English version. Uploads 3 photos. Selects "Perfume" category. Sets price in UAH. Saves.

**Multilingual content behavior she discovers:** On product 3, she fills only the UK field and leaves EN empty. She opens the live site on her phone and switches to English. The product page renders — but both the product name and description fields are empty. No 404, no fallback to Ukrainian. **MVP decision: a product with an empty locale field shows blank on that locale's storefront — no silent fallback to default locale.** Tetiana adds "fill both EN and UK before publishing" to her onboarding checklist. A completeness indicator in Admin is noted as a post-MVP improvement.

**Edge Case:** She accidentally publishes a product without a photo. A customer places an order on it. She feels a spike of panic — a live order on a product with no image. She opens Medusa Admin → Orders, reads the order details, adds the photo to the product, and sends the customer a manual email from her own inbox. No developer needed, but the gap (no photo validation gate) is a known MVP limitation.

**Resolution:** After a week, her full catalog is live. She manages it herself. She emails Andriy once — to ask for a bulk import feature for the next batch.

**Journey Capabilities Revealed:** Medusa Admin multilingual product fields (per-locale, no auto-fallback, blank-on-empty is designed behavior), image management, category management, draft/published states, order detail view.

---

### Journey 4: End Customer (Buyer) — First Purchase and Return

**Meet Sofiia**, Lviv, browsing on her phone via Instagram ad.

**Opening Scene:** She lands on the homepage in Ukrainian (browser locale resolved via URL segment — `/uk/`). She browses "Floral" category. Taps "Bloom No.5." Reads the Ukrainian description. Price: 890 UAH. In stock.

**Rising Action:** She taps "Add to cart." Cart persists server-side (Medusa cart entity). Taps "Checkout." She creates an account at checkout (email + password — guest checkout also available). Fills delivery details. Selects "Нова Пошта" from a static delivery options dropdown (no live rates in MVP). Enters card via Stripe.

**Edge Case:** First attempt — card declined (wrong CVV). Error message: "Your card was declined. Please check your card details and try again." No option to switch payment method in MVP (Stripe card only). Her cart is fully preserved — all items still present. She corrects the CVV and submits. Stripe processes in 2 seconds. Confirmation screen: "Order #1023 confirmed." Email confirmation arrives.

**Return Journey (6 weeks later):** Sofiia logs back in, reorders in under 2 minutes from order history. Saved address still correct.

**Support scenario:** New order is delayed. No live chat on the storefront. She replies to the confirmation email — goes to Tetiana's inbox. Tetiana handles via Medusa Admin order details. This is the MVP support path.

**Journey Capabilities Revealed:** Mobile-responsive storefront, URL-based locale routing (`/uk/`, `/en/`), persistent server-side cart, guest + account checkout, Stripe with error handling and cart preservation, order confirmation email, customer account with order history, static delivery options list.

---

### Journey 5: Agency Operator — Provisioning and Operating Multiple Clients

**Meet Andriy again**, 6 months later. The agency has 3 live clients. A fourth has just signed.

**Provisioning:** He runs the agency's provisioning script, which creates: a new PostgreSQL database, a new Medusa backend instance, a new Next.js storefront, a per-client Stripe restricted key with its own webhook endpoint pointing to this client's backend, and a staging subdomain. Each client is a full fork of the canonical template — **fork model, not npm dependency model**. Template updates are manual cherry-picks; clients may diverge over time.

**Ongoing Ops — Isolation Checklist:** separate PostgreSQL DB ✓, separate Medusa backend ✓, separate Next.js storefront ✓, per-client Stripe key + dedicated webhook endpoint ✓. Deferred to architecture decision: per-client media storage (separate S3 bucket vs. prefix), per-client email sender domain (SPF/DKIM per client, or shared agency sender), per-client search index namespace (if Meilisearch/Algolia added).

**The 11pm Scene:** It's Friday evening. Tetiana messages Andriy: "the checkout isn't working." Andriy SSHs into client 3's server, tails the Medusa logs, finds a Stripe webhook misconfiguration after a key rotation. **MVP observability: direct server log access per-client, no automated alerts.** Time to resolution: ~40 minutes. Agreed threshold: centralized log aggregation before client 4 goes live.

**Template Divergence:** He notices client 2's codebase has a one-off customization that never made it back to the template. He provisions client 4 from the canonical template, documents client 2's divergence as tech debt.

**Journey Capabilities Revealed:** Per-client full isolation (DB/backend/storefront/Stripe/webhook), fork-based template model, provisioning script, manual per-server observability (MVP), structured log aggregation before client 4 (agreed threshold).

---

### Journey Requirements Summary

| Journey | Capabilities Required |
|---|---|
| Developer Launch | Template CLI, Figma token → Tailwind mapping, Figma MCP (API read → local write), typed override layer, per-client env config, Stripe sandbox, staging→prod deploy |
| Designer → Component | MCP pipeline with typed `.override.tsx`, design token support, Cyrillic rendering, designer review loop |
| Store Owner Admin | Medusa Admin: per-locale product fields (blank-on-empty, no auto-fallback), images, categories, draft/publish, order detail view |
| End Customer Purchase | Mobile storefront, URL-based locale routing, server-side cart persistence, guest+account checkout, Stripe error handling + cart preservation, order email, account history, static delivery options |
| Agency Operator | Full per-client isolation, fork model template, provisioning script, manual observability (MVP), structured logs before client 4 |

**Explicit product decisions:**
- **Locale routing:** URL-segment based (`/uk/`, `/en/`) — safe for SEO and edge caching
- **Missing locale field behavior:** blank on storefront, no fallback — by design in MVP
- **Stripe decline UX:** error message shown, cart preserved, retry same card only (no payment method switch in MVP)
- **Customer account:** in MVP scope (created at checkout)
- **Bulk product import:** post-MVP
- **In-store support widget:** post-MVP; MVP = email reply to order confirmation
- **Observability threshold:** centralized log aggregation before client 4

**Failure State Glossary:**

| Scenario | Storefront/System Shows | Owner | MVP Scope |
|---|---|---|---|
| Product with empty locale field | Blank content fields on that locale (page renders, no 404) | Store owner (fill both fields) | In scope — by design |
| Stripe card declined | "Your card was declined. Please check your card details." Cart preserved. | Customer self-service | In scope |
| Medusa backend down | Storefront errors (unconfigured error page) | Agency operator (server logs) | Known gap — error page post-MVP |
| Photo missing on published product | Product shows no image — page still accessible | Store owner (manual fix) | Known gap — validation gate post-MVP |
| Checkout down at 11pm | No automated alert — discovered via client report | Agency operator (SSH + logs) | Known gap — alerting before client 4 |

## Domain Requirements

### Платёжные провайдеры

- **Тестовый магазин (парфюмерия) — MVP:** Stripe (UK/EU аудитория)
- **Платформа — Growth:** WayForPay / LiqPay для клиентов с украинской аудиторией (UAH)
- Платформа: isolated-only, per-client — конкретный провайдер выбирается при деплое. Никакого multi-tenancy.
- **Технический риск (Growth phase):** Medusa v2 провайдер для WayForPay не подтверждён; потребуется кастомная реализация (WayForPay использует HMAC/MD5 подпись, sandbox требует отдельного merchant agreement). Оценить до старта Phase 2.
- **Cash on Delivery:** post-MVP

### PCI DSS

- Платформа не хранит и не проксирует raw card data
- Только tokenization через провайдера (Stripe.js / hosted fields), iframe/redirect flow
- Никаких proxy-endpoints через серверы платформы

### Регуляторные требования

- **Обязательные элементы сайта (UA):** контакты, политика возврата, публичная оферта, юридические реквизиты продавца — на всех активных языках
- **РРО/ПРРО (UA):** ответственность клиента (владельца магазина), не агентства. Интеграция с ПРРО-провайдером (Checkbox и др.) — Growth phase.
- **Закон Украины "Об электронной коммерции":** обязательное подтверждение заказа по email с полными данными — влияет на email-шаблоны и retention policy для orders
- **UK GDPR (MVP):** тестовый магазин продаёт в UK → cookie consent и right-to-deletion обязательны с day one
- **Украинский закон о персональных данных №2297-VI:** применим для UA пользователей параллельно с GDPR

## Innovation & Novel Patterns

### Инновационные аспекты

**1. Figma MCP Pipeline как основной путь создания storefront**

Дизайнер работает в Figma → Figma MCP (через Claude) генерирует React-компоненты → разработчик дорабатывает. Дизайн — primary source of truth. Workflow **уже подтверждён на практике**.

- Ни WordPress, ни Shopify, ни Webflow не работают по этой модели
- Каждый клиентский магазин выглядит как кастомный продукт, не шаблон
- Время от дизайна до рабочего компонента — часы, не дни

**2. Agency-as-deployer модель вместо SaaS**

Агентство деплоит изолированный инстанс для каждого клиента. Нет зависимости от vendor платформы, нет shared infrastructure рисков.

### Конкурентный ландшафт

- **Локальные конкуренты:** WordPress/WooCommerce — шаблонные магазины, plugin lock-in
- **Глобальные платформы (Shopify):** multi-tenant SaaS, ограниченный контроль, дизайн вторичен
- **Differentiator:** Figma-driven уникальный дизайн + headless архитектура + полный контроль

### Валидация и риски

- **Уже валидировано:** Figma MCP workflow работает на практике
- **Валидирует тестовый магазин:** полный цикл от Figma до production ≤5 дней; второй клиент подтверждает повторяемость
- **Ключевая метрика:** % компонентов через MCP без ручной правки (MVP: <30%, Growth: <10%)

| Риск | Митигация |
|---|---|
| MCP output качество варьируется | Typed override layer; дизайнер аннотирует токены |
| MCP API меняется | Override layer изолирует ручные правки от перегенерации |
| Клиентский код diverges от template | Fork model + provisioning script; template как canonical source |

## Agency Platform — Специфические требования

### Деплой-архитектура

- **Next.js storefront** → Vercel (per-client проект)
- **Medusa backend** → Hetzner VPS (Docker Compose + Nginx; Node.js long-running процесс, несовместим с Vercel serverless)
- **PostgreSQL** → отдельная БД per-client на том же Hetzner VPS
- **Медиафайлы** → Cloudflare R2 (S3-совместимый), per-client bucket или prefix
- **Секреты** → env vars при деплое, никаких секретов в репозитории

**Обязательные env vars per-client:**
```
MEDUSA_BACKEND_URL, DATABASE_URL, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET,
RESEND_API_KEY, NEXT_PUBLIC_GA_MEASUREMENT_ID, NEXT_PUBLIC_BASE_URL,
CLOUDFLARE_R2_ACCESS_KEY, CLOUDFLARE_R2_SECRET_KEY, CLOUDFLARE_R2_BUCKET
```

### Модель доступа

- Стандартная Medusa v2 Admin RBAC из коробки — кастомных ролей в MVP нет
- Кастомная RBAC — post-MVP

### Интеграции (MVP)

| Интеграция | Провайдер | Детали реализации |
|---|---|---|
| Email | Resend | Medusa Notification Provider (не прямой SDK-вызов); шаблоны в коде; locale-aware; правки только через dev PR |
| Аналитика | Google Analytics | `next/script strategy="afterInteractive"`; GA events в `"use client"` компонентах; Consent Mode v2 |
| Платежи | Stripe | Medusa Payment Provider |
| Медиафайлы | Cloudflare R2 | Medusa File Provider; `next.config.js` remotePatterns |

**Resend payload для order confirmation (минимум):** order_id, items (name, qty, price), totals, shipping address, locale.

### Developer Tooling (не product features)

**Figma MCP** — инструмент разработчика для генерации React-компонентов из Figma. Не требует acceptance criteria в backlog. Workflow описан в разделе Innovation.

### SEO

- `generateMetadata()` для динамических мета (продукты, коллекции) — не client-side
- `app/sitemap.ts` — динамический, с `hreflang` для каждого locale и `x-default` → `en`
- `<html lang={locale}>` в `app/[locale]/layout.tsx`
- Canonical URL per-locale (не всегда на `/en/`)
- `app/robots.ts` — блокирует staging от индексации
- `next/image` с `sizes` и `priority` для hero — обязательно для Core Web Vitals

### Исключено из MVP

- Кастомная RBAC; multi-tenant shared infrastructure
- WayForPay / LiqPay; Cash on Delivery
- Централизованная observability (до клиента 4)
- ПРРО/РРО интеграция (ответственность клиента)
- Редактирование email-шаблонов клиентом (только через dev PR)

## Project Scoping & Phased Development

### MVP Strategy

**Подход:** Platform MVP — доказываем повторяемость. Первый магазин (парфюмерия) валидирует стек end-to-end. Второй магазин валидирует масштабируемость без переписывания.

**Команда:** 1 разработчик + 1 дизайнер.

### Phase 1 — MVP: Тестовый магазин + Платформа

*Платформа (шаблон):*
- Medusa v2 backend: product, cart, order, payment (Stripe), customer
- Next.js storefront: главная, каталог, товар, корзина, checkout, личный кабинет
- EN/UK мультиязычность (URL-based `/en/`, `/uk/`); сценарий "один язык"
- Provisioning script (Hetzner + Vercel)
- Per-client env config

*Тестовый магазин (парфюмерия):*
- Каталог с категориями, фото (Cloudflare R2), описаниями EN/UK
- Корзина + checkout + Stripe payment
- Статический список способов доставки
- Личный кабинет покупателя (история заказов, профиль)
- Order confirmation email (Resend)
- Google Analytics + Consent Mode v2
- Cookie consent banner (UK GDPR)
- SEO: `generateMetadata()`, sitemap с `hreflang`, `robots.ts`, Core Web Vitals
- Обязательные страницы: контакты, политика возврата, публичная оферта

### Phase 2 — Growth

- WayForPay / LiqPay для UA рынка (кастомный Medusa provider)
- Cash on Delivery
- Интеграция с перевозчиками (Нова Пошта — расчёт стоимости, трекинг)
- Промо-механики: купоны, скидки, акции (Medusa promotions module)
- Централизованный observability dashboard
- RU язык (третий locale)
- Кастомная RBAC в Medusa Admin
- Редактирование email-шаблонов без разработчика
- Bulk product import

### Phase 3 — Vision

- Marketplace: несколько продавцов на одной платформе
- AI-assisted onboarding: новый магазин по описанию бизнеса
- Figma → полный сайт без ручного кода
- ПРРО/РРО интеграция (фискализация)

### Risk Mitigation

| Риск | Митигация |
|---|---|
| WayForPay Medusa provider не существует | Проверить до старта Phase 2; оценить кастомную разработку отдельно |
| Figma MCP output < 70% | Typed override layer; дизайнер аннотирует токены |
| Provisioning script ломается на втором клиенте | Тестировать на реальном втором деплое |
| UK GDPR нарушение | Cookie consent в MVP — зафиксировано |
| Medusa несовместим с Vercel | Явно задокументировано: Medusa → Hetzner VPS |

## Functional Requirements

### Каталог и товары

- **FR1:** Покупатель может просматривать каталог товаров с фильтрацией по категориям
- **FR2:** Покупатель может просматривать детальную страницу товара с фото, описанием и ценой
- **FR3:** Покупатель может видеть статус наличия товара
- **FR4:** Владелец магазина может создавать, редактировать и удалять товары
- **FR5:** Владелец магазина может управлять категориями товаров
- **FR6:** Владелец магазина может загружать и управлять фотографиями товаров
- **FR7:** Владелец магазина может переключать статус товара (черновик / опубликован)
- **FR8:** Владелец магазина может задавать цену товара в UAH

### Мультиязычность и локализация

- **FR9:** Покупатель может переключать язык интерфейса и контента (EN / UK)
- **FR10:** Владелец магазина может вводить названия и описания товаров отдельно для каждого языка
- **FR11:** Система отображает контент на языке соответствующего locale-префикса URL
- **FR12:** Товар с незаполненным полем языка отображает пустое поле на этом языке (без автофолбека)
- **FR13:** Storefront поддерживает конфигурацию с одним активным языком

### Корзина и оформление заказа

- **FR14:** Покупатель может добавлять товары в корзину
- **FR15:** Покупатель может просматривать и редактировать содержимое корзины
- **FR16:** Корзина покупателя сохраняется при сбое платежа
- **FR17:** Покупатель может оформить заказ как гость или как зарегистрированный пользователь
- **FR18:** Покупатель может выбрать способ доставки из статического списка
- **FR19:** Покупатель может оплатить заказ банковской картой через платёжного провайдера
- **FR20:** Покупатель получает понятное сообщение об ошибке при неудачном платеже

### Аккаунт покупателя

- **FR21:** Покупатель может зарегистрироваться и войти в личный кабинет
- **FR22:** Покупатель может просматривать историю своих заказов
- **FR23:** Покупатель может управлять своими контактными данными и адресами доставки
- **FR24:** Покупатель получает email-подтверждение после оформления заказа

### Управление заказами

- **FR25:** Владелец магазина может просматривать список всех заказов
- **FR26:** Владелец магазина может просматривать детали конкретного заказа
- **FR27:** Система отправляет email-уведомление покупателю при оформлении заказа

### Соответствие требованиям (Compliance)

- **FR28:** Покупатель видит cookie consent banner при первом посещении
- **FR29:** Покупатель может принять или отклонить аналитические cookie
- **FR30:** Аналитика активируется только после согласия покупателя
- **FR31:** Покупатель может запросить удаление своих персональных данных
- **FR32:** На сайте доступны страницы: контакты, политика возврата, публичная оферта

### SEO и обнаружение

- **FR33:** Каждая страница товара и коллекции имеет уникальные мета-теги и Open Graph данные
- **FR34:** Сайт предоставляет динамический sitemap с поддержкой мультиязычных URL
- **FR35:** Поисковые роботы заблокированы на staging-окружениях

### Аналитика

- **FR36:** Владелец магазина может отслеживать трафик и поведение покупателей через Google Analytics
- **FR37:** Система отслеживает ключевые события конверсии (добавление в корзину, оформление заказа, покупка)

### Деплой и провижининг (Agency Operations)

- **FR38:** Разработчик агентства может развернуть новый клиентский инстанс (backend + storefront) с помощью provisioning script
- **FR39:** Каждый клиентский инстанс работает изолированно (отдельный backend, БД, storefront, ключи API)
- **FR40:** Разработчик агентства может конфигурировать платёжного провайдера per-client через переменные окружения

### Figma → Storefront Pipeline (Developer Tooling)

- **FR41:** Разработчик агентства может сгенерировать React-компонент из Figma-дизайна через MCP
- **FR42:** Сгенерированный компонент поддерживает точечные overrides, которые сохраняются при перегенерации
- **FR43:** Дизайнер может задавать design tokens в Figma, которые отображаются в Tailwind-конфиге storefront

## Non-Functional Requirements

### Performance

- **NFR1:** Страницы storefront (каталог, товар) загружаются за < 3 секунды на мобильном устройстве при 4G соединении
- **NFR2:** Core Web Vitals в зелёной зоне: LCP < 2.5с, CLS < 0.1, INP < 200мс
- **NFR3:** Stripe checkout flow завершается (от нажатия "оплатить" до confirmation screen) за < 5 секунд при стабильном соединении
- **NFR4:** Medusa Admin загружает список товаров (до 500 позиций) за < 2 секунды

### Security

- **NFR5:** Все данные передаются только по HTTPS — HTTP запросы редиректятся
- **NFR6:** Raw card data не проходит через серверы платформы — только tokenization через Stripe.js
- **NFR7:** Каждый клиентский инстанс изолирован на уровне БД — cross-client data access невозможен
- **NFR8:** Все API-ключи и секреты хранятся только в переменных окружения, не в коде или репозитории
- **NFR9:** Medusa Admin доступен только аутентифицированным пользователям
- **NFR10:** Персональные данные покупателей хранятся только в рамках конкретного клиентского инстанса

### Scalability

- **NFR11:** Один Hetzner VPS (CX32, 4 vCPU / 8GB RAM) поддерживает одновременную работу до 5 клиентских Medusa инстансов
- **NFR12:** Добавление нового клиентского инстанса не требует изменений в существующих инстансах
- **NFR13:** Next.js storefront на Vercel автоматически масштабируется под трафик без ручного вмешательства

### Accessibility

- **NFR14:** Storefront соответствует WCAG 2.1 уровня AA для основных user flows (просмотр каталога, checkout)
- **NFR15:** Storefront функционален при отключённом JavaScript для SEO-критичных страниц (каталог, товар)

### Reliability

- **NFR16:** Stripe webhook обрабатывается в течение 30 секунд после получения — повторная доставка при сбое
- **NFR17:** Потеря соединения во время checkout не приводит к дублированию платежа
- **NFR18:** Medusa backend логирует все ошибки уровня 500 в структурированном формате (JSON) — для диагностики через SSH
