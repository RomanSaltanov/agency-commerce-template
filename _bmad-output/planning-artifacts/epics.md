---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-final-validation']
inputDocuments: ['_bmad-output/planning-artifacts/prd.md', '_bmad-output/planning-artifacts/architecture.md']
---

# Agency Commerce Platform - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for the Agency Commerce Platform, decomposing the requirements from the PRD and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Buyer can browse product catalog with category filtering
FR2: Buyer can view product detail page with photos, description, and price
FR3: Buyer can see product availability status
FR4: Store owner can create, edit, and delete products
FR5: Store owner can manage product categories
FR6: Store owner can upload and manage product photos
FR7: Store owner can toggle product status (draft / published)
FR8: Store owner can set product price in UAH
FR9: Buyer can switch interface and content language (EN / UK)
FR10: Store owner can enter product names and descriptions separately for each language
FR11: System displays content in the language of the URL locale prefix
FR12: Product with unfilled language field displays blank on that language (no auto-fallback)
FR13: Storefront supports configuration with a single active language
FR14: Buyer can add products to cart
FR15: Buyer can view and edit cart contents
FR16: Buyer's cart is preserved on payment failure
FR17: Buyer can checkout as guest or registered user
FR18: Buyer can select delivery method from a static list
FR19: Buyer can pay for order with a bank card via payment provider
FR20: Buyer receives a clear error message on payment failure
FR21: Buyer can register and log into personal account
FR22: Buyer can view their order history
FR23: Buyer can manage their contact details and delivery addresses
FR24: Buyer receives email confirmation after placing an order
FR25: Store owner can view list of all orders
FR26: Store owner can view details of a specific order
FR27: System sends email notification to buyer when order is placed
FR28: Buyer sees cookie consent banner on first visit
FR29: Buyer can accept or reject analytics cookies
FR30: Analytics activates only after buyer consent
FR31: Buyer can request deletion of their personal data
FR32: Site has pages: contacts, return policy, public offer
FR33: Each product and collection page has unique meta tags and Open Graph data
FR34: Site provides dynamic sitemap with multilingual URL support
FR35: Search robots are blocked on staging environments
FR36: Store owner can track traffic and buyer behavior via Google Analytics
FR37: System tracks key conversion events (add to cart, checkout, purchase)
FR38: Agency developer can deploy new client instance (backend + storefront) using provisioning script
FR39: Each client instance runs in isolation (separate backend, DB, storefront, API keys)
FR40: Agency developer can configure payment provider per-client via environment variables
FR41: Agency developer can generate React component from Figma design via MCP
FR42: Generated component supports point overrides that survive regeneration
FR43: Designer can set design tokens in Figma that map to Tailwind config in storefront

### NonFunctional Requirements

NFR1: Storefront pages (catalog, product) load in < 3 seconds on mobile at 4G connection
NFR2: Core Web Vitals in green zone: LCP < 2.5s, CLS < 0.1, INP < 200ms
NFR3: Stripe checkout flow completes (from "pay" to confirmation screen) in < 5 seconds on stable connection
NFR4: Medusa Admin loads product list (up to 500 items) in < 2 seconds
NFR5: All data transmitted over HTTPS only — HTTP requests redirected
NFR6: Raw card data does not pass through platform servers — only tokenization via Stripe.js
NFR7: Each client instance is isolated at DB level — cross-client data access impossible
NFR8: All API keys and secrets stored only in environment variables, not in code or repository
NFR9: Medusa Admin accessible only to authenticated users
NFR10: Buyer personal data stored only within the specific client instance
NFR11: One Hetzner VPS (CX32, 4 vCPU / 8GB RAM) supports up to 5 simultaneous client Medusa instances
NFR12: Adding a new client instance requires no changes to existing instances
NFR13: Next.js storefront on Vercel scales automatically under traffic without manual intervention
NFR14: Storefront meets WCAG 2.1 level AA for core user flows (catalog browsing, checkout)
NFR15: Storefront functional with JavaScript disabled for SEO-critical pages (catalog, product)
NFR16: Stripe webhook processed within 30 seconds of receipt — retry on failure
NFR17: Loss of connection during checkout does not result in duplicate payment
NFR18: Medusa backend logs all 500-level errors in structured format (JSON) — for SSH diagnosis

### Additional Requirements

From Architecture — technical requirements that affect implementation:

- **Starter template (storefront):** clone `medusajs/nextjs-starter-medusa` (Next.js 15.3.9, Tailwind ^3, TS ^5.3.2); rename `[countryCode]` → `[locale]` segment
- **i18n UI strings:** add `next-intl`; messages in `storefront/messages/uk.json` and `en.json`; middleware merges next-intl locale routing with `x-medusa-locale` header
- **Translation module:** enable `MEDUSA_FF_TRANSLATION=true` on backend; locale_code format = short BCP 47 (`uk`, `en`)
- **Region handling:** cookie `_medusa_region`; MVP: `DEFAULT_REGION=ua` hardcoded in env; CountrySelect UI hidden
- **Docker Compose:** per-client stack with explicit CPU/memory limits (`cpus: 0.75`, `memory: 1536M`); MikroORM pool `{min:1, max:5}`
- **Deploy sequence:** `yarn build` → `npx medusa db:migrate` → `docker compose up -d` (migrations always before start)
- **CI/CD backend:** GitHub Actions → `appleboy/ssh-action` → SSH to Hetzner → `docker compose pull && up`
- **Storefront deploy:** Vercel, push-to-git auto deploy per-client project
- **Secrets:** `.env` files on server at `/opt/clients/{name}/.env`; GitHub Actions stores only SSH deploy key
- **Monorepo structure:** `backend/` + `storefront/` + `scripts/` + `.github/` in one repo
- **Provisioning script:** `scripts/provision-client.sh` — creates DB, backend instance, storefront Vercel project, Stripe restricted key + webhook, staging subdomain
- **Per-client isolation:** separate PostgreSQL DB, separate Docker Compose stack, separate Stripe key + webhook endpoint, separate Cloudflare R2 bucket
- **Figma MCP override pattern:** `.override.tsx` colocated with generated file; must have `import type { Props } from "./component"` explicit import; always via PR never direct commit
- **ESLint enforcement:** `no-restricted-imports` on bare `"zod"`; workflow ID namespace lint rule
- **Workflow ID namespace:** `{domain}-{verb}-{noun}` for template; `{client-slug}/{domain}-{verb}-{noun}` for client overrides
- **GDPR deletion:** anonymization model (not hard-delete); deletion registry pattern — any new PII integration must register a deletion handler as CI gate
- **Lighthouse CI gate:** enforces Core Web Vitals NFR automatically — not prose-only
- **Stripe 5 failure branches:** timeout, requires_action 3DS, payment_failed, crash-after-charge, tab-close during redirect — each needs explicit handling
- **Email legal structure:** order confirmation must include: itemized goods, price with VAT, delivery terms, cancellation rights, seller legal details

### UX Design Requirements

No UX design document exists at this stage. UI will be generated via Figma MCP pipeline per client. Storefront visual design is client-specific; template provides structural/functional foundation only.

### FR Coverage Map

FR1: Epic 2 — Buyer browses catalog with category filtering
FR2: Epic 2 — Buyer views product detail page
FR3: Epic 2 — Buyer sees product availability status
FR4: Epic 2 — Store owner creates/edits/deletes products
FR5: Epic 2 — Store owner manages product categories
FR6: Epic 2 — Store owner uploads and manages product photos
FR7: Epic 2 — Store owner toggles draft/published status
FR8: Epic 2 — Store owner sets price in UAH
FR9: Epic 2 — Buyer switches language EN/UK
FR10: Epic 2 — Store owner enters per-language product fields
FR11: Epic 2 — System displays content by URL locale prefix
FR12: Epic 2 — Blank-on-empty for unfilled locale fields (no auto-fallback)
FR13: Epic 2 — Storefront supports single active language config
FR14: Epic 3 — Buyer adds products to cart
FR15: Epic 3 — Buyer views and edits cart
FR16: Epic 3 — Cart preserved on payment failure
FR17: Epic 3 — Guest or registered checkout
FR18: Epic 3 — Buyer selects delivery from static list
FR19: Epic 3 — Buyer pays with bank card via Stripe
FR20: Epic 3 — Buyer receives clear error message on payment failure
FR21: Epic 4 — Buyer registers and logs in
FR22: Epic 4 — Buyer views order history
FR23: Epic 4 — Buyer manages contact details and addresses
FR24: Epic 3 — Buyer receives order confirmation email
FR25: Epic 2 — Store owner views order list (Medusa Admin)
FR26: Epic 2 — Store owner views order details (Medusa Admin)
FR27: Epic 3 — System sends email notification on order placement
FR28: Epic 5 — Cookie consent banner on first visit
FR29: Epic 5 — Buyer accepts or rejects analytics cookies
FR30: Epic 5 — Analytics activates only after consent
FR31: Epic 5 — Buyer requests personal data deletion
FR32: Epic 5 — Legal pages: contacts, return policy, public offer
FR33: Epic 5 — Unique meta tags and Open Graph per product/collection page
FR34: Epic 5 — Dynamic sitemap with multilingual URLs
FR35: Epic 5 — Search robots blocked on staging
FR36: Epic 5 — GA4 traffic and behavior tracking
FR37: Epic 5 — Conversion event tracking (add to cart, checkout, purchase)
FR38: Epic 1 + Epic 7 — Agency developer deploys new client instance via provisioning script
FR39: Epic 1 + Epic 7 — Each client instance runs in full isolation
FR40: Epic 1 + Epic 7 — Payment provider configured per-client via env vars
FR41: Epic 6 — Agency developer generates React component from Figma via MCP
FR42: Epic 6 — Generated component supports typed overrides that survive regeneration
FR43: Epic 6 — Designer sets Figma design tokens that map to Tailwind config

## Epic List

### Epic 1: Platform Foundation & Infrastructure
Agency developer can clone the template, bring up the full stack locally, and deploy to staging — complete CI/CD, Docker, secrets, base configuration.
**FRs covered:** FR38, FR39, FR40 (foundation layer)
**Arch reqs:** starter clone + locale routing setup, Docker Compose with resource limits, GitHub Actions CI/CD, secrets management, monorepo structure, ESLint enforcement, workflow ID namespace, MikroORM pool config

### Epic 2: Product Catalog & Multilingual Content
Buyer can browse the product catalog with category filtering, view detailed product pages with photos and prices, see availability — fully localized EN/UK. Store owner manages all catalog content via Medusa Admin.
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR8, FR9, FR10, FR11, FR12, FR13, FR25, FR26

### Epic 3: Cart & Checkout with Stripe
Buyer can build a cart, checkout as guest or authenticated user, pay by card, and receive order confirmation. All 5 Stripe failure branches handled. Cart preserved on failure.
**FRs covered:** FR14, FR15, FR16, FR17, FR18, FR19, FR20, FR24, FR27

### Epic 4: Customer Account
Buyer can register, log in, view order history, and manage delivery addresses and contact details.
**FRs covered:** FR21, FR22, FR23

### Epic 5: Compliance, SEO & Analytics
Site meets GDPR (cookie consent, right to deletion), has full SEO (metadata, sitemap with hreflang, robots.ts), and GA4 analytics with Consent Mode v2. Legal pages present.
**FRs covered:** FR28, FR29, FR30, FR31, FR32, FR33, FR34, FR35, FR36, FR37

### Epic 6: Figma MCP Pipeline
Agency developer can generate React components from Figma via MCP, use the typed override layer that survives regeneration, and map design tokens to Tailwind config.
**FRs covered:** FR41, FR42, FR43

### Epic 7: Agency Provisioning & Multi-Client Operations
Agency developer can deploy a second client store using the provisioning script — full per-client isolation (DB, backend, storefront, Stripe, R2), minimal manual steps, documented sync process.
**FRs covered:** FR38, FR39, FR40 (full provisioning automation)

---

## Epic 1: Platform Foundation & Infrastructure

Agency developer can deploy the full stack to staging (Hetzner + Vercel), configure CI/CD, and verify the platform is operational — complete foundation for all further development.

**FRs covered:** FR38, FR39, FR40
**Arch reqs:** Docker Compose with resource limits, GitHub Actions CI/CD, secrets management, monorepo structure, ESLint enforcement, MikroORM pool config, next-intl setup, locale routing

### Story 1.1: Medusa Backend — Staging Deployment on Hetzner

As an agency developer,
I want to deploy the Medusa v2 backend to Hetzner staging via Docker Compose and verify it's running,
So that I have a working backend foundation accessible for all further development.

**Acceptance Criteria:**

**Given** the monorepo repo exists with `backend/Dockerfile` and `backend/docker-compose.yml`
**When** the developer SSHes to Hetzner and runs `docker compose up -d`
**Then** the Medusa backend starts and `GET https://staging-api.{domain}/health` returns 200

**Given** a running Medusa instance on Hetzner
**When** the developer opens `https://staging-api.{domain}/app`
**Then** Medusa Admin UI loads and allows admin user creation

**Given** `backend/docker-compose.yml`
**When** reviewed
**Then** it has explicit CPU/memory limits (`cpus: 0.75`, `memory: 1536M`) and reads secrets from `/opt/clients/staging/.env`

**Given** `backend/medusa-config.ts`
**When** reviewed
**Then** MikroORM pool is `{min:1, max:5}`, `MEDUSA_FF_TRANSLATION=true` is configured, and `.env.template` lists all required vars with no hardcoded secrets

**Given** `backend/.eslintrc.js`
**When** `yarn lint` runs
**Then** `no-restricted-imports` blocks bare `import { z } from "zod"` with a clear error

### Story 1.2: Storefront — Base Setup on Vercel

As an agency developer,
I want to deploy the Next.js storefront to Vercel with locale routing configured and connected to the staging Medusa backend,
So that I have a working storefront foundation for building all commerce pages.

**Acceptance Criteria:**

**Given** `medusajs/nextjs-starter-medusa` is cloned into `storefront/`
**When** the developer reviews `src/app/` directory
**Then** the dynamic segment is renamed from `[countryCode]` to `[locale]` in all file paths and references

**Given** the storefront is connected to staging Medusa backend
**When** `next-intl` is installed and configured with `storefront/src/i18n/routing.ts` (`locales: ['uk', 'en'], defaultLocale: 'uk'`)
**Then** `storefront/messages/uk.json` and `storefront/messages/en.json` exist with base UI string keys

**Given** the storefront is deployed to Vercel
**When** browser opens `https://staging.{domain}/uk`
**Then** the storefront homepage renders without errors and `x-medusa-locale: uk` is sent to the backend on all API requests

**Given** browser opens `https://staging.{domain}/en`
**When** the page loads
**Then** the storefront renders in English and `x-medusa-locale: en` is sent to the backend

**Given** `storefront/middleware.ts`
**When** reviewed
**Then** next-intl locale routing and `x-medusa-locale` header injection are both handled in a single middleware

### Story 1.3: GitHub Actions CI/CD Pipeline (Dev + Prod)

As an agency developer,
I want automated deployments for both environments — `develop` branch deploys to dev, `main` branch deploys to production,
So that I can develop safely on dev without touching production until explicitly merging.

**Acceptance Criteria:**

**Given** `.github/workflows/deploy-dev.yml` exists
**When** a push to `develop` branch occurs
**Then** GitHub Actions SSHes to Hetzner dev, runs `docker compose pull && docker compose up -d` with correct sequence (`yarn build` → `db:migrate` → `up`)

**Given** `.github/workflows/deploy-prod.yml` exists
**When** a push to `main` branch occurs
**Then** GitHub Actions SSHes to Hetzner prod and runs the same deploy sequence on the production stack

**Given** `.github/workflows/lint.yml` exists
**When** any PR is opened
**Then** `yarn lint` and `tsc --noEmit` run and block merge on failure

**Given** Vercel has two projects: `storefront-dev` (connected to `develop`) and `storefront-prod` (connected to `main`)
**When** a push to respective branch occurs
**Then** Vercel auto-deploys to the correct environment without manual steps

**Given** GitHub Actions secrets
**When** reviewed
**Then** dev and prod have separate SSH keys and host vars (`HETZNER_DEV_HOST`, `HETZNER_PROD_HOST`, `HETZNER_DEV_SSH_KEY`, `HETZNER_PROD_SSH_KEY`) — no `.env` values in GitHub secrets

### Story 1.4: Production Environment Setup

As an agency developer,
I want a production environment on Hetzner and Vercel that mirrors dev configuration,
So that I can deploy the first live client store when development is complete.

**Acceptance Criteria:**

**Given** `/opt/clients/production/.env` exists on Hetzner prod
**When** reviewed
**Then** it contains production values for all vars from `.env.template` — separate PostgreSQL DB, Stripe live keys, Resend API key, Cloudflare R2 bucket, correct `MEDUSA_BACKEND_URL`

**Given** `docker compose up -d` runs on Hetzner prod
**When** `GET https://api.{domain}/health` is called
**Then** it returns 200 and the backend is running with the same resource limits as dev

**Given** Vercel `storefront-prod` project is deployed
**When** browser opens `https://{domain}/uk`
**Then** the storefront renders and connects to the production Medusa backend

**Given** both dev and prod environments are running
**When** a change is merged from `develop` → `main`
**Then** production deploys automatically via GitHub Actions without affecting the dev environment

**Given** production `.env`
**When** reviewed
**Then** `NEXT_PUBLIC_MEDUSA_BACKEND_URL` points to prod backend, not dev — environments are fully isolated

## Epic 2: Product Catalog & Multilingual Content

Agency developer and store owner can set up the product catalog with multilingual content (EN/UK), and buyers can browse the catalog and product pages fully localized.

**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR8, FR9, FR10, FR11, FR12, FR13, FR25, FR26
**Arch reqs:** next-intl, translation module, locale routing, blank-on-empty, explicit locale param in data functions, Cloudflare R2 for media

### Story 2.1: Medusa — Product Catalog Setup (Region, Locales, Categories)

As a store owner,
I want to configure the Medusa backend with a Ukrainian region, EN/UK locales, product categories, and test products with multilingual content,
So that the storefront has real data to display.

**Acceptance Criteria:**

**Given** Medusa Admin is accessible on staging
**When** the developer creates a region "Ukraine" with currency UAH and country UA
**Then** `GET /store/regions` returns the Ukraine region with UAH currency

**Given** `MEDUSA_FF_TRANSLATION=true` is enabled
**When** the developer opens Medusa Admin → Settings → Locales
**Then** locales `uk` and `en` are available and can be enabled for the store

**Given** locales are configured
**When** the developer creates a product with title/description in both `uk` and `en`
**Then** `GET /store/products?locale=uk` returns Ukrainian content and `GET /store/products?locale=en` returns English content

**Given** a product where only `uk` fields are filled
**When** `GET /store/products?locale=en` is called
**Then** the response returns empty string (not Ukrainian fallback) for unfilled English fields

**Given** Medusa Admin
**When** the developer creates at least 2 product categories (e.g. "Парфуми", "Догляд")
**Then** `GET /store/product-categories` returns the categories with correct locale content

### Story 2.2: Storefront — Catalog Page

As a buyer,
I want to browse the product catalog at `/[locale]/store` with category filtering and see product names, photos, and prices,
So that I can find products I'm interested in.

**Acceptance Criteria:**

**Given** buyer opens `https://staging.{domain}/uk/store`
**When** the page loads
**Then** all published products are displayed with Ukrainian titles, prices in UAH, and product photos

**Given** buyer opens `https://staging.{domain}/en/store`
**When** the page loads
**Then** products display English titles (or blank if not translated — no Ukrainian fallback shown)

**Given** catalog page with categories configured
**When** buyer clicks a category filter
**Then** only products from that category are displayed

**Given** `storefront/src/lib/data/products.ts`
**When** reviewed
**Then** `listProducts(params, locale)` passes locale as explicit parameter and sends `x-medusa-locale` header to backend

**Given** a product that is in draft status
**When** buyer views the catalog
**Then** the draft product is not visible in the storefront

**Given** catalog page on mobile
**When** rendered
**Then** product grid is responsive and meets WCAG 2.1 AA contrast requirements

### Story 2.3: Storefront — Product Detail Page

As a buyer,
I want to view a product detail page at `/[locale]/products/[handle]` with photos, description, price, availability status, and variant selection,
So that I can make an informed purchase decision.

**Acceptance Criteria:**

**Given** buyer opens `/uk/products/bloom-5`
**When** the page loads
**Then** Ukrainian title, description, price in UAH, product photos, and availability status are displayed

**Given** buyer opens `/en/products/bloom-5` for a product with empty English fields
**When** the page loads
**Then** title and description fields are blank — page renders without 404, no Ukrainian fallback

**Given** `storefront/src/lib/data/products.ts`
**When** reviewed
**Then** `getProduct(handle, locale)` passes locale as explicit parameter

**Given** product detail page
**When** rendered with JavaScript disabled
**Then** product title, description, and price are visible (SSR, no client-only data fetching for indexable content)

**Given** product detail page
**When** `generateMetadata()` is called
**Then** meta title and description use the product's locale-specific content; if fields are blank — meta tags are omitted (not empty strings)

**Given** product has multiple variants (e.g. sizes)
**When** buyer selects a variant
**Then** price updates to reflect the selected variant's price

### Story 2.4: Language Switcher & Blank-on-Empty Behavior

As a buyer,
I want to switch the interface language between UK and EN via a language selector,
So that I can browse the store in my preferred language.

**Acceptance Criteria:**

**Given** buyer is on any storefront page
**When** they click the language switcher in the nav/footer
**Then** they are redirected to the same page with the opposite locale prefix (`/uk/` ↔ `/en/`) without losing their position

**Given** buyer switches to EN
**When** a product has empty English fields
**Then** those fields show blank — no Ukrainian text appears as fallback, page does not show 404

**Given** `storefront/messages/uk.json` and `storefront/messages/en.json`
**When** language is switched
**Then** all static UI strings (buttons, labels, navigation) switch to the correct language via `next-intl`

**Given** buyer navigates to `/uk/store`
**When** browser's `<html>` tag is inspected
**Then** `lang="uk"` is set correctly for screen readers and SEO

**Given** buyer navigates to `/en/store`
**When** browser's `<html>` tag is inspected
**Then** `lang="en"` is set correctly

### Story 2.5: Cloudflare R2 Image Integration

As a store owner,
I want to upload product photos via Medusa Admin and have them stored in Cloudflare R2 and displayed on the storefront,
So that product pages show real product images.

**Acceptance Criteria:**

**Given** `CLOUDFLARE_R2_ACCESS_KEY`, `CLOUDFLARE_R2_SECRET_KEY`, `CLOUDFLARE_R2_BUCKET` are set in `.env`
**When** store owner uploads a photo in Medusa Admin → Product → Media
**Then** the file is stored in the configured R2 bucket and the product's `thumbnail` field contains the R2 URL

**Given** a product with an R2 photo URL
**When** buyer views the product on the storefront
**Then** the photo loads via `next/image` with correct `remotePatterns` configured in `next.config.js`

**Given** `next/image` is used for all product images
**When** the catalog page loads
**Then** hero/first images use `priority` prop and all images have `sizes` attribute for Core Web Vitals (LCP)

**Given** a product with no photo uploaded
**When** buyer views that product
**Then** a placeholder image or empty state is shown — no broken image icon, no 500 error

## Epic 3: Cart & Checkout with Stripe

Buyer can build a cart, checkout as guest or authenticated user, pay by card, and receive order confirmation. All 5 Stripe failure branches handled. Cart preserved on failure.

**FRs covered:** FR14, FR15, FR16, FR17, FR18, FR19, FR20, FR24, FR27
**Arch reqs:** Stripe 5 failure branches (timeout, requires_action 3DS, payment_failed, crash-after-charge, tab-close during redirect), idempotency key storage, email legal structure, static delivery list

### Story 3.1: Cart — Add, View, Edit

As a buyer,
I want to add products to my cart, view the cart contents, and edit quantities or remove items,
So that I can prepare my order before checkout.

**Acceptance Criteria:**

**Given** buyer is on a product detail page
**When** they click "Add to cart"
**Then** the product is added to the server-side Medusa cart and cart count in the nav updates

**Given** buyer opens `/[locale]/cart`
**When** the page loads
**Then** all cart items are displayed with product name, photo, price in UAH, and quantity

**Given** buyer changes quantity of an item in the cart
**When** they update the quantity
**Then** the cart total updates to reflect the new quantity

**Given** buyer removes an item from the cart
**When** they click remove
**Then** the item is removed and cart total recalculates

**Given** buyer's cart exists with items
**When** buyer closes the browser and returns later
**Then** the cart is still intact (server-side persistence via `_medusa_cart_id` cookie)

**Given** cart is empty
**When** buyer opens `/[locale]/cart`
**Then** an empty cart state is shown with a link to the store

### Story 3.2: Checkout — Address & Delivery

As a buyer,
I want to fill in my delivery address and select a delivery method from a static list during checkout,
So that I can proceed to payment with complete order details.

**Acceptance Criteria:**

**Given** buyer proceeds to checkout from cart
**When** they land on the checkout page
**Then** they see a step for delivery address (first name, last name, email, phone, address, city) and a step for delivery method selection

**Given** buyer is not logged in
**When** they reach the checkout address step
**Then** they can fill in the form as a guest without being forced to register

**Given** buyer is logged in
**When** they reach the checkout address step
**Then** their saved address is pre-filled

**Given** the delivery method step
**When** buyer views delivery options
**Then** a static list of options is displayed (e.g. "Нова Пошта — склад", "Нова Пошта — адресна") with fixed prices

**Given** buyer completes address and delivery steps
**When** they proceed to payment
**Then** the cart is updated with the selected shipping method and buyer's address

**Given** checkout form
**When** buyer submits with missing required fields
**Then** validation errors are shown inline — form does not proceed to payment

### Story 3.3: Stripe Payment — All Failure Branches

As a buyer,
I want to pay for my order by card via Stripe and receive clear feedback for any payment outcome,
So that I can complete my purchase or understand exactly what went wrong.

**Acceptance Criteria:**

**Given** buyer reaches the payment step with a valid cart
**When** they enter card details via Stripe.js hosted fields and click "Pay"
**Then** the payment is processed and buyer is redirected to the order confirmation page

**Given** buyer enters a declined card (wrong CVV or insufficient funds)
**When** Stripe returns `payment_failed`
**Then** the error message "Your card was declined. Please check your card details and try again." is shown, cart is fully preserved with all items

**Given** Stripe requires 3DS authentication (`requires_action`)
**When** the 3DS modal appears
**Then** buyer completes authentication and the payment resumes — cart preserved throughout

**Given** buyer's connection times out during payment
**When** no response is received from Stripe within the timeout window
**Then** buyer sees an error message, cart is preserved, and no duplicate charge is created (idempotency key enforced)

**Given** buyer closes the tab during Stripe redirect
**When** they return to the storefront later
**Then** cart is still intact and they can retry payment — no duplicate charge

**Given** a crash occurs on the backend after Stripe charges but before order is created
**When** buyer retries payment
**Then** idempotency key prevents a second charge and the order is recovered

**Given** payment step
**When** reviewed
**Then** raw card data never passes through platform servers — only Stripe.js tokenization is used (NFR6)

### Story 3.4: Order Confirmation + Email (Resend)

As a buyer,
I want to receive an order confirmation on screen and by email immediately after payment succeeds,
So that I have a record of my purchase with all legally required details.

**Acceptance Criteria:**

**Given** buyer completes payment successfully
**When** they are redirected to the confirmation page
**Then** they see an order summary displaying: order number, list of items with name and quantity, itemised prices, total with VAT breakdown, selected delivery method and address, and estimated delivery timeframe

**Given** order is created in Medusa
**When** the `order.placed` event fires
**Then** the Resend notification provider sends an HTML email to the buyer's email address within 30 seconds

**Given** the confirmation email
**When** reviewed against legal requirements (ARch req: EU-aligned email structure)
**Then** the email contains: itemised list of goods with unit price and quantity, total price with VAT amount, delivery method and address, cancellation rights notice, seller legal name, address, and registration number

**Given** buyer placed order with locale `uk`
**When** the confirmation email is sent
**Then** email subject and body are in Ukrainian

**Given** buyer placed order with locale `en`
**When** the confirmation email is sent
**Then** email subject and body are in English

**Given** Resend API is unreachable at the moment of sending
**When** the notification provider fails
**Then** the order is still created and persisted — email failure does not roll back the order; a retry is queued via Resend's built-in retry mechanism

**Given** the order confirmation page URL `/[locale]/order/confirmed/[order-id]`
**When** buyer shares or revisits the URL
**Then** the page is protected — only accessible to the authenticated buyer who placed the order or a guest matching the email used at checkout (token-protected URL)

**Tasks:**

1. Install and configure `@medusajs/notification-resend` provider in `backend/medusa-config.ts`
2. Create locale-aware email templates in `storefront/emails/` using React Email components:
   - `order-confirmation.uk.tsx`
   - `order-confirmation.en.tsx`
3. Register the `order.placed` subscriber in backend that calls the notification provider with locale from the order's cart context
4. Build `/[locale]/order/confirmed/[id]` page in the storefront with all required fields
5. Add token-based access guard for the confirmation page (guest token in URL, session check for logged-in users)
6. Write unit test for the subscriber to verify correct locale selection and email trigger

---

## Epic 4: Customer Account

### Story 4.1: Registration & Login (Email + Google OAuth)

As a buyer,
I want to register an account with my email or Google, and log in to access my personal data,
So that my orders and address are saved for future purchases.

**Acceptance Criteria:**

**Given** buyer opens the registration page `/[locale]/account/register`
**When** they fill in email, password (min 8 chars), and click "Register"
**Then** an account is created in Medusa, buyer is automatically logged in, and redirected to the account dashboard

**Given** buyer submits registration with an already-registered email
**When** Medusa returns a conflict error
**Then** the form shows "An account with this email already exists. Did you mean to log in?"

**Given** buyer opens the login page `/[locale]/account/login`
**When** they enter valid email and password
**Then** they are authenticated (Medusa JWT stored in cookie) and redirected to their account dashboard

**Given** buyer enters wrong email or password
**When** the login request fails
**Then** a generic error message is shown: "Invalid email or password" — no indication of which field is wrong

**Given** buyer is on the login or registration page
**When** they click "Continue with Google"
**Then** they are redirected to Google OAuth flow; on success, a Medusa account is created or linked, and buyer is logged in

**Given** authenticated buyer visits any `/[locale]/account/` page
**When** the session cookie is valid
**Then** the page renders with their data

**Given** an unauthenticated buyer visits any `/[locale]/account/` page (except login/register)
**When** the middleware checks the session
**Then** buyer is redirected to `/[locale]/account/login`

**Given** buyer clicks "Log out"
**When** the action fires
**Then** the session cookie is cleared and buyer is redirected to the homepage

**Tasks:**

1. Build `/[locale]/account/register` page with email/password form and Google OAuth button
2. Build `/[locale]/account/login` page with email/password form and Google OAuth button
3. Configure Medusa Auth Provider: `@medusajs/auth-emailpass` + `@medusajs/auth-google` in `backend/medusa-config.ts`
4. Add Next.js middleware to protect all `/[locale]/account/` routes (redirect to login if no session)
5. Implement logout action that clears the Medusa session cookie
6. Add `_medusa_jwt` cookie handling in the storefront SDK client

### Story 4.2: Account Dashboard — Order History

As a buyer,
I want to see a list of all my past orders with their status and details,
So that I can track what I ordered and when.

**Acceptance Criteria:**

**Given** authenticated buyer visits `/[locale]/account/orders`
**When** the page loads
**Then** all their past orders are listed sorted by date descending, each showing: order number, date placed, total amount, and current status (Processing / Shipped / Delivered / Cancelled)

**Given** buyer has no past orders
**When** they visit the orders page
**Then** an empty state is shown with a link to the store

**Given** buyer clicks on an order in the list
**When** the order detail page `/[locale]/account/orders/[order-id]` loads
**Then** they see: itemised list of products (name, quantity, unit price), subtotal, VAT breakdown, total, delivery address, delivery method, and order status

**Given** an order changes status (e.g. from Processing to Shipped) in the Medusa admin
**When** buyer refreshes the orders page
**Then** the updated status is reflected

**Given** buyer attempts to access `/[locale]/account/orders/[order-id]` belonging to another customer
**When** the request is made
**Then** a 404 is returned — no data leakage between accounts

**Tasks:**

1. Build `/[locale]/account/orders` page with order list using Medusa `store.orders.list` endpoint
2. Build `/[locale]/account/orders/[id]` detail page with full order breakdown
3. Add ownership guard on order detail page (compare order's `customer_id` with session customer)
4. Create reusable `<OrderSummary>` component shared between order detail page and post-checkout confirmation page (Story 3.4)
5. Add order status badge component with locale-aware status labels (`uk`/`en`)

### Story 4.3: Address Book & Profile Management

As a buyer,
I want to save and manage my delivery addresses and update my profile details,
So that I don't have to re-enter them at every checkout.

**Acceptance Criteria:**

**Given** authenticated buyer visits `/[locale]/account/addresses`
**When** the page loads
**Then** all saved addresses are listed; the default address is visually marked

**Given** buyer clicks "Add address"
**When** they fill in the address form (first name, last name, phone, address, city, postal code) and submit
**Then** the new address is saved to their Medusa customer profile and appears in the list

**Given** buyer clicks "Edit" on a saved address
**When** they modify fields and save
**Then** the address is updated in Medusa and the list reflects the change

**Given** buyer clicks "Delete" on a non-default address
**When** confirmed
**Then** the address is removed from their profile

**Given** buyer tries to delete their default address
**When** they confirm deletion
**Then** they are prompted to either set another address as default or proceed with no default

**Given** buyer sets an address as default
**When** they proceed to checkout
**Then** the checkout address step is pre-filled with the default address

**Given** buyer visits `/[locale]/account/profile`
**When** the page loads
**Then** they can update their first name, last name, email, and phone number

**Given** buyer wants to change their password
**When** they submit the password change form with current password and new password (min 8 chars, confirmed)
**Then** the password is updated; if current password is wrong, an error is shown

**Tasks:**

1. Build `/[locale]/account/addresses` page with CRUD operations via Medusa `store.customers.addresses` endpoints
2. Build `/[locale]/account/profile` page with profile update form and password change section
3. Wire default address selection to checkout pre-fill logic (Story 3.2)
4. Add delete confirmation modal with default-address reassignment prompt
5. Validate password change form client-side (min 8 chars, match confirmation) before sending to backend

---

## Epic 5: Compliance, SEO & Analytics

### Story 5.1: Cookie Consent & GDPR Compliance

As a buyer,
I want to be clearly informed about cookies and data collection, and be able to manage my consent,
So that my privacy rights are respected and the platform is legally compliant.

**Acceptance Criteria:**

**Given** a first-time visitor lands on any page
**When** no consent cookie is present
**Then** a cookie consent banner is shown with "Accept all", "Reject non-essential", and "Manage preferences" options

**Given** visitor clicks "Accept all"
**When** consent is saved
**Then** analytics and marketing cookies are enabled, consent is stored in `_cookie_consent` cookie (1-year expiry), and the banner is dismissed

**Given** visitor clicks "Reject non-essential"
**When** consent is saved
**Then** only strictly necessary cookies are active, analytics are not loaded, and the banner is dismissed

**Given** visitor clicks "Manage preferences"
**When** the preferences modal opens
**Then** they can toggle consent for each category (Necessary, Analytics, Marketing) individually

**Given** buyer navigates to `/[locale]/privacy-policy`
**When** the page loads
**Then** a complete privacy policy is displayed in the correct locale covering: data collected, purposes, retention periods, third-party processors (Stripe, Resend, Google), and buyer rights

**Given** buyer navigates to `/[locale]/cookie-policy`
**When** the page loads
**Then** a full list of cookies used is shown with name, purpose, and expiry for each

**Given** authenticated buyer submits a GDPR data deletion request
**When** they confirm via `/[locale]/account/delete`
**Then** their personal data is anonymised (not hard-deleted) in Medusa per the architecture's GDPR anonymisation model; buyer receives a confirmation email

**Given** Google Tag Manager is loaded
**When** buyer has not accepted analytics consent
**Then** GTM fires in consent mode with `analytics_storage: denied` — no GA4 events are sent until consent is granted

**Tasks:**

1. Implement cookie consent banner component with three actions and per-category preferences modal
2. Store consent state in `_cookie_consent` cookie and expose a React context for consent state
3. Gate GTM/GA4 initialisation behind analytics consent check (GTM Consent Mode v2)
4. Create static CMS pages for `/[locale]/privacy-policy` and `/[locale]/cookie-policy` with locale-specific content
5. Build `/[locale]/account/delete` page with confirmation flow that calls the GDPR anonymisation endpoint
6. Add GDPR anonymisation endpoint to backend (anonymise customer PII fields, retain order records with anonymised references)

### Story 5.2: SEO — Meta Tags, Sitemap & Structured Data

As a store owner,
I want every page to have proper SEO metadata, a sitemap, and structured data,
So that search engines can index and rank the store effectively.

**Acceptance Criteria:**

**Given** any product detail page
**When** crawled by a search engine
**Then** the page has: `<title>` with product name and store name, `<meta name="description">` from the product description (truncated to 160 chars), `og:image` from the first product image, and `og:type: product`

**Given** product detail page for locale `uk`
**When** crawled
**Then** `<html lang="uk">` is set and `<link rel="alternate" hreflang="en">` points to the equivalent English URL

**Given** product detail page for locale `en`
**When** crawled
**Then** `<html lang="en">` is set and `<link rel="alternate" hreflang="uk">` points to the equivalent Ukrainian URL

**Given** a product exists in Medusa
**When** the sitemap is requested at `/sitemap.xml`
**Then** the URL is present in the sitemap for all active locales (`uk`, `en`)

**Given** category listing page
**When** crawled
**Then** the page has a unique `<title>` and `<meta name="description">` from the category description

**Given** a product detail page
**When** the page is rendered
**Then** JSON-LD structured data of type `Product` is present with: name, description, image, price, currency, and availability

**Given** product is out of stock
**When** the JSON-LD is rendered
**Then** `availability` is set to `OutOfStock`

**Given** storefront is deployed
**When** `/robots.txt` is requested
**Then** it allows crawling of all store pages and references `/sitemap.xml`

**Tasks:**

1. Implement `generateMetadata()` in Next.js for product pages, category pages, and static pages — pulling title/description from Medusa with locale parameter
2. Add `hreflang` alternate links in all page metadata for `uk` and `en`
3. Create `/app/sitemap.ts` dynamic sitemap generator that fetches all products and categories from Medusa
4. Add JSON-LD `<Product>` structured data component to product detail pages
5. Create `/public/robots.txt` with correct directives — block all crawlers on staging (FR35), allow all on production
6. Ensure meta tags are omitted (not empty) when content is blank for a given locale (blank-on-empty rule from architecture)
7. Create static locale-aware pages for FR32: `/[locale]/contacts`, `/[locale]/return-policy`, `/[locale]/public-offer` — placeholder content with correct metadata; content filled per-client during provisioning

### Story 5.3: Analytics — Google Tag Manager & GA4

As a store owner,
I want to track buyer behaviour and key e-commerce events via GA4 through GTM,
So that I can measure store performance and optimise the buyer journey.

**Acceptance Criteria:**

**Given** GTM container ID is configured in environment variables
**When** any page loads with analytics consent granted
**Then** GTM script is initialised and GA4 is active

**Given** buyer views a product detail page
**When** the page loads
**Then** a `view_item` GA4 event is fired with: item name, item ID, price, and currency

**Given** buyer adds a product to the cart
**When** "Add to cart" is clicked
**Then** an `add_to_cart` GA4 event is fired with item details and quantity

**Given** buyer reaches the checkout
**When** each checkout step is completed (address, delivery, payment)
**Then** `begin_checkout` and `add_shipping_info` / `add_payment_info` events are fired

**Given** buyer completes a purchase
**When** redirected to the order confirmation page
**Then** a `purchase` GA4 event is fired with: transaction ID (order number), value, currency, and full items array

**Given** buyer has rejected analytics consent
**When** any of the above events would fire
**Then** no GA4 events are sent (GTM Consent Mode v2 blocks them)

**Given** GTM container ID is not set in environment variables
**When** any page loads
**Then** GTM is not initialised and no tracking errors appear in the console

**Tasks:**

1. Add GTM script initialisation in `storefront/app/layout.tsx` gated behind analytics consent context (Story 5.1)
2. Create `useAnalytics` hook that reads consent state and provides `trackEvent(name, params)` — no-op when consent is denied
3. Implement `view_item` event on product detail page
4. Implement `add_to_cart` event in cart action
5. Implement `begin_checkout`, `add_shipping_info`, `add_payment_info` events in checkout steps
6. Implement `purchase` event on order confirmation page
7. Add `NEXT_PUBLIC_GTM_ID` to `.env.example` with instructions

---

## Epic 6: Figma MCP Pipeline

### Story 6.1: Figma MCP Setup & Code Connect Configuration

As a developer,
I want the Figma MCP server connected to the codebase with Code Connect mappings,
So that design changes in Figma can be pulled into code with minimal manual bridging.

**Acceptance Criteria:**

**Given** a developer opens the project in Claude Code
**When** the Figma MCP server is active
**Then** `mcp__figma__whoami` returns the authenticated Figma user without errors

**Given** the Code Connect map is configured
**When** `mcp__figma__get_code_connect_map` is called with the project's Figma file key
**Then** it returns mappings linking Figma component node IDs to their storefront component paths

**Given** a Figma component has a Code Connect mapping
**When** a developer asks Claude Code to implement the component
**Then** Claude Code uses `mcp__figma__get_design_context` to read the Figma node and generates code using the mapped component as the base

**Given** a new Figma component has no Code Connect mapping yet
**When** `mcp__figma__get_code_connect_suggestions` is called
**Then** suggestions are returned based on naming similarity to existing storefront components

**Tasks:**

1. Add Figma MCP server to `.claude/mcp-config.json` with `FIGMA_API_KEY` from environment
2. Create initial Code Connect map via `mcp__figma__add_code_connect_map` covering core components: ProductCard, CartItem, CheckoutStep, Button, Input
3. Document the `FIGMA_FILE_KEY` env variable in `.env.example`
4. Add `figma-code-connect` skill invocation instructions to `CLAUDE.md` for the project
5. Verify end-to-end: pull a Figma component screenshot via `mcp__figma__get_screenshot` and confirm it renders in Claude Code context

### Story 6.2: Component Override Workflow (.override.tsx Pattern)

As a developer,
I want a clear, repeatable workflow for applying Figma-generated code to production components,
So that UI updates from Figma never bypass TypeScript safety or break existing logic.

**Acceptance Criteria:**

**Given** Figma MCP generates a component implementation
**When** the output file is created
**Then** it is saved as `ComponentName.generated.tsx` (never directly as the production component file)

**Given** a `ComponentName.generated.tsx` file exists
**When** a developer creates the override file
**Then** `ComponentName.override.tsx` is colocated in the same directory and begins with `import type { Props } from "./ComponentName.generated"` — explicit Props import is mandatory

**Given** the override file imports Props from the generated file
**When** the Props interface changes in a Figma regeneration
**Then** TypeScript compilation fails with a clear type error — the developer is forced to reconcile the change before merging

**Given** the production component (`ComponentName.tsx`)
**When** reviewed
**Then** it imports from `.override.tsx`, not from `.generated.tsx` directly — generated files are never imported by application code

**Given** a component has no Figma-driven logic (e.g. pure business logic component)
**When** reviewed
**Then** no `.generated.tsx` or `.override.tsx` files exist for it — the pattern is only applied to UI components sourced from Figma

**Given** a developer runs `yarn type-check` in the storefront
**When** a regenerated Figma component has a Props mismatch with its override
**Then** the build fails — this serves as the CI gate preventing broken overrides from merging

**Tasks:**

1. Document the `.generated.tsx` → `.override.tsx` → `.tsx` three-file pattern in `storefront/COMPONENTS.md`
2. Add ESLint rule to forbid direct imports of `*.generated.tsx` files outside of `*.override.tsx` files
3. Create example implementation for `ProductCard`: `product-card.generated.tsx`, `product-card.override.tsx`, `product-card.tsx`
4. Add `yarn type-check` step to GitHub Actions CI workflow (runs on every PR)
5. Add `.generated.tsx` to `.gitignore` with a comment explaining it is Figma MCP output and should be regenerated, not committed

---

## Epic 7: Agency Provisioning & Multi-Client Operations

### Story 7.1: New Client Provisioning Scripts

As an agency developer,
I want a set of scripts that bootstrap a new client environment on Hetzner in minutes,
So that onboarding a new client is repeatable, error-free, and doesn't require manual server configuration.

**Acceptance Criteria:**

**Given** a developer runs `scripts/provision-client.sh <client-name>`
**When** the script completes
**Then** the following are created: `/opt/clients/<client-name>/` directory on the Hetzner VPS, a `.env` file from the template with client-specific values, a `docker-compose.yml` with correct resource limits (`cpus: 0.75`, `memory: 1536M` per container), and a Cloudflare R2 bucket for the client's media

**Given** the provisioning script creates the `.env` file
**When** reviewed
**Then** it contains all required variables: `DATABASE_URL`, `REDIS_URL`, `MEDUSA_BACKEND_URL`, `STRIPE_SECRET_KEY`, `RESEND_API_KEY`, `CLOUDFLARE_R2_*`, `JWT_SECRET`, `COOKIE_SECRET` — with no secrets committed to git

**Given** provisioning completes successfully
**When** `docker compose up -d` is run in the client directory
**Then** the Medusa backend starts, runs migrations, and is reachable at the client's domain

**Given** a developer runs `scripts/provision-client.sh` with a client name that already exists
**When** the script detects the existing directory
**Then** it exits with an error and does not overwrite the existing environment

**Given** a new client environment is provisioned
**When** `scripts/seed-client.sh <client-name>` is run
**Then** default regions (`ua`), currencies (`UAH`), and a default sales channel are created in Medusa via the Admin API

**Tasks:**

1. Create `scripts/provision-client.sh` that: creates `/opt/clients/<client>/`, copies `scripts/templates/.env.template` with placeholder substitution, copies `scripts/templates/docker-compose.template.yml`, creates Cloudflare R2 bucket via `wrangler` CLI
2. Create `scripts/seed-client.sh` that: calls Medusa Admin API to seed region (`ua`/`UAH`), default sales channel, and a placeholder shipping option
3. Create `scripts/templates/.env.template` with all required variables and descriptive comments
4. Create `scripts/templates/docker-compose.template.yml` with resource limits pre-configured
5. Add `scripts/README.md` with step-by-step provisioning instructions for agency developers
6. Ensure `scripts/` is excluded from storefront and backend builds

### Story 7.2: Multi-Client Monitoring & Operations

As an agency developer,
I want visibility into the health of all client environments on the shared Hetzner VPS,
So that I can detect issues early and perform maintenance without downtime.

**Acceptance Criteria:**

**Given** multiple client Docker Compose stacks are running on the VPS
**When** `scripts/status-all.sh` is run
**Then** it outputs a table showing: client name, container status (running/stopped/restarting), uptime, and memory usage for each container

**Given** a client container crashes or restarts unexpectedly
**When** Docker's restart policy triggers (`restart: unless-stopped`)
**Then** the container restarts automatically without manual intervention

**Given** a new release is ready for a specific client
**When** `scripts/deploy-client.sh <client-name> <image-tag>` is run from the developer's machine
**Then** the GitHub Actions deploy workflow is triggered for that client's environment via `workflow_dispatch`, pulling the new image and running `docker compose up -d` with zero-downtime restart

**Given** the Medusa backend image is updated
**When** the deploy script runs
**Then** `npx medusa db:migrate` is executed before the new container starts, and the old container is stopped only after the new one is healthy

**Tasks:**

1. Create `scripts/status-all.sh` that iterates `/opt/clients/*/` and runs `docker compose ps` + `docker stats --no-stream` for each
2. Ensure all `docker-compose.template.yml` containers have `restart: unless-stopped` and a `healthcheck` defined
3. Add `workflow_dispatch` trigger with `client` and `image_tag` inputs to `.github/workflows/deploy.yml`
4. Update deploy workflow to run `db:migrate` before swapping containers (use Docker health check to gate the swap)
5. Add log rotation config to Docker Compose (`logging.driver: json-file`, `max-size: 10m`, `max-file: 3`) to prevent disk exhaustion on shared VPS
