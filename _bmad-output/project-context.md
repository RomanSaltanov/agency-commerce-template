---
project_name: 'agency-commerce-template'
user_name: 'Romansaltanov'
date: '2026-05-14'
sections_completed: ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'quality_rules', 'workflow_rules', 'anti_patterns']
status: 'complete'
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

- **Medusa**: 2.15.2 (monorepo, Yarn 3.2.1 workspaces + Turborepo)
- **TypeScript**: 5.9.3, target ES2021, module Node16
- **Node.js**: minimum v20 — MikroORM 6.x + module Node16 require Node ≥ 20; Node 18 causes ESM/CJS interop failures
- **ORM**: MikroORM 6.6.12 + PostgreSQL only (pg ^8.16.3) — no SQLite fallback, ORM is wired for PG exclusively
- **DI Container**: Awilix ^8.0.1
- **HTTP**: Express ^4.21.0
- **Validation**: Zod 4.2.0 — import ONLY via `@medusajs/framework/zod`; direct `import { z } from "zod"` resolves a different transitive version
- **Admin UI**: React ^18.3.1 + Vite + Tailwind CSS (with `@medusajs/ui-preset`) + `@medusajs/ui` component library (Radix UI underneath)
- **Admin State**: TanStack Query **v5** (5.64.2) — NOT v4; breaking changes: `gcTime` not `cacheTime`, `onSuccess`/`onError` removed from `useQuery`, query keys must be arrays
- **Admin Router**: React Router DOM **v6** (6.30.3) — no `useHistory`, no `<Switch>`, no `<Redirect>`
- **Forms**: React Hook Form 7.49.1 + Zod resolvers
- **Tests (backend)**: Jest 29.7.0 with `@swc/jest` transformer (NOT ts-jest)
- **Tests (frontend)**: Vitest 3.0.5
- **i18n**: i18next 23.7.11

## Critical Implementation Rules

### Language-Specific Rules

**TypeScript Configuration:**
- `noUnusedLocals=true` — unused imports/variables fail compilation; remove all unused decorator imports explicitly
- `strictNullChecks=true` + `noImplicitReturns=true` — all code paths in non-void functions must return a value
- `noImplicitAny=false` — explicit `any` compiles but is disallowed by convention; use `unknown` + type guard or an explicit interface instead; when using `container.resolve()` always annotate: `container.resolve<IPromotionModuleService>(Modules.PROMOTION)`
- `emitDecoratorMetadata=true` + `experimentalDecorators=true` — required for DI decorators; never disable in tsconfig or SWC config

**Import/Export Patterns:**
- Use path aliases (`@models`, `@services`, `@types`, `@repositories`, `@utils`) for intra-package imports — never use relative paths like `../../models/order`
- For relative imports without aliases, add `.js` extension on source `.ts` files (e.g. `import { foo } from "./utils.js"`) — Node16 ESM resolution requires this at compile time
- Framework imports must come from the re-export packages — NOT from the direct packages:

  | Use | Import from | NOT from |
  |---|---|---|
  | Decorators / utils | `@medusajs/framework/utils` | `@medusajs/utils` |
  | Types | `@medusajs/framework/types` | `@medusajs/types` |
  | Workflows SDK | `@medusajs/framework/workflows-sdk` | `@medusajs/workflows-sdk` |
  | HTTP types | `@medusajs/framework/http` | — |
  | Zod | `@medusajs/framework/zod` | `zod` (direct) |

- Barrel exports via `export * from "./file"` in `index.ts` — always import from the barrel, not from the sibling file directly
- Cross-layer imports are forbidden: workflow steps must not import from API route files; services must not reach into another module's internals — must go through the DI container

**Service Decorator Rules:**
- `@InjectManager()` — on public methods; creates a new manager if none exists
- `@InjectTransactionManager()` — on protected internal methods only; requires an existing transaction; never put on a public method
- `@MedusaContext()` — always the last parameter with default value `= {}`
- `@EmitEvents()` — must be the outermost decorator (written first/topmost); decorators apply bottom-up in TypeScript, so `@EmitEvents` must wrap the transaction boundary, not be wrapped by it — getting this wrong fires events before commits

**Data Models:**
- Define entities with `model.define("EntityName", {...})` — the `"EntityName"` string MUST exactly match the identifier used in the module's `joiner-config.ts`; mismatch causes a silent runtime resolution failure with no compile-time error
- Never use raw MikroORM decorators (`@Entity()`, `@Property()`, `@ManyToOne()`); code compiles but won't integrate with Medusa's module system and migrations break

**Error Handling:**
- Always use `new MedusaError(type, message)` — never throw plain `new Error()`
- Error types: `MedusaError.Types.NOT_FOUND`, `INVALID_DATA`, `NOT_ALLOWED`, `CONFLICT`
- Validate in workflow steps for cross-module concerns; services trust their callers
- Use `validateEmail()` from `@medusajs/framework/utils` for email validation

**Zod v4 Gotchas:**
- `z.string().nonempty()` does not exist in v4 — use `z.string().min(1)`
- `z.object()` defaults to `.strip()` in v4 — silently drops unknown keys; use `.passthrough()` if full pass-through is needed
- Most Stack Overflow answers and LLM training data reflect Zod v3 syntax; when Zod code looks reasonable but fails, check whether it's a v3 pattern
- Zod schemas belong in route validators (`validators.ts`), not in workflow steps or services

**Formatting (Prettier — enforced in CI):**
- No semicolons
- Double quotes
- 2-space indentation
- ES5 trailing commas (objects, arrays, function params)
- Arrow functions always parenthesized: `(x) => x` not `x => x`

### Framework-Specific Rules

**Module Pattern:**
- Module entry point: `export default Module(Modules.MODULE_NAME, { service: MyService })`
- Service extends `MedusaService<{ EntityName: { dto: EntityDTO } }>(EntityModel)`
- Must have `joiner-config.ts` via `defineJoinerConfig(Modules.X, { models, schema, linkableKeys })` — required for any module that exposes data to `useQueryGraphStep()` or participates in a module link; `linkableKeys` values must match the entity's primary key field names, not DTO names
- Module isolation: services must NOT import from other modules directly — cross-module reads go through `useQueryGraphStep()` in workflows, or `ContainerRegistrationKeys.QUERY` in steps; `container.resolve(Modules.OTHER)` inside a module service is an architectural violation
- `@MedusaContext() sharedContext: Context = {}` must be the final parameter on all service methods that call other service methods — dropping it breaks transaction propagation across service layers

**Service Decorator Rules (public/protected split):**
- Public methods: `@InjectManager()` — creates a new manager if none exists
- Protected implementation methods (convention: `methodName_` suffix): `@InjectTransactionManager()` — requires existing transaction
- Never apply both to the same method; never put `@InjectTransactionManager()` on a public method
- Decorator order: `@EmitEvents()` outermost (written first/topmost), `@InjectManager()` below — decorators apply bottom-up; getting this wrong fires events before commits

**API Route Pattern:**
- Named exports UPPERCASE only: `export const GET = ...`, `export const POST = ...` — lowercase `get`, `post` are silently ignored by the route loader
- `AuthenticatedMedusaRequest<T>` for protected routes, `MedusaRequest<T>` for public — using the wrong one compiles fine but fails auth middleware at runtime
- Only `route.ts` is required by the route loader; `middlewares.ts`, `validators.ts`, `query-config.ts` are conventions that must be explicitly imported and wired — they are NOT auto-discovered
- Validation belongs in `middlewares.ts` via `validateAndTransformBody()` / `validateAndTransformQuery()` — never inline in the route handler
- `req.queryConfig.fields` is only populated if `retrieveConfig` or `listConfig` is exported from `query-config.ts` and wired through middleware
- Access: `req.scope.resolve()`, `req.filterableFields`, `req.queryConfig.pagination`, `req.queryConfig.fields`

**Workflow Pattern:**
- Input type: `WorkflowData<T>`, return: `new WorkflowResponse<T>(result)`
- Steps return: `new StepResponse(result, compensationData)`
- **Workflow IDs are global string keys** — duplicate IDs silently override each other; convention: `<domain>-<verb>-<noun>` (e.g. `"delete-promotion-rules"`); search `packages/core/core-flows/src/` before registering a new ID
- Workflows must be **deterministic** — no `Date.now()`, `Math.random()`, or direct I/O in the workflow function body; all side effects go inside steps
- `transform()` is pure and has no container access — do not attempt to resolve services inside it
- `useQueryGraphStep()` for cross-module data reads — do NOT resolve modules directly in workflows; workflows using `useQueryGraphStep()` require integration test context (cannot be unit-tested with mocked containers)
- Compensation functions for destructive operations: test them by invoking `workflowName(container).run({ input })` and throwing inside a step to force rollback
- `createHook("hookName", payload)` — hooks must be passed to `new WorkflowResponse(result, { hooks: [hookVar] })`; consumers subscribe via `myWorkflow.hooks.hookName(handler)`; hook handlers run inside the workflow transaction

**Cross-Module Links:**
- Cross-module entity links are defined in `packages/links/` via `defineLink(ModuleA.linkable.entityA, ModuleB.linkable.entityB)`
- Never add foreign keys between modules inside model files
- Access the link service via `container.resolve(ContainerRegistrationKeys.LINK)`

**Migrations:**
- Run `yarn medusa db:generate <module-name>` — NEVER `mikro-orm migration:create` directly; the latter produces incompatible output
- Migration files land in `src/migrations/` inside the module package

**Admin UI Pattern:**
- Use `@medusajs/ui` components exclusively — do NOT import Radix UI primitives directly (version conflict with the preset is guaranteed)
- TanStack Query **v5** hooks: `useQuery`, `useMutation` — v4 patterns (`cacheTime`, `onSuccess`/`onError` in useQuery) are broken
- React Hook Form + Zod resolver via `@hookform/resolvers/zod`
- React Router **v6**: `useNavigate()` not `useHistory()`, `<Routes>` not `<Switch>`
- All user-facing strings via `useTranslation()` from `react-i18next`
- Admin UI tests use Vitest; components require QueryClient, Router, and i18n providers — check for a shared test render utility before writing wrapper boilerplate

### Testing Rules

**Runner Selection — use this decision tree:**
```
What are you testing?
├── Pure function / class method, no DB  → Jest unit test, __tests__/ alongside source
├── Module service with real DB          → moduleIntegrationTestRunner
├── Cross-module workflow (no HTTP)      → medusaIntegrationTestRunner
├── HTTP endpoint behavior               → medusaIntegrationTestRunner (with api axios)
└── React component / hook               → Vitest + Testing Library
```

**Two Distinct Test Runners (from `@medusajs/test-utils`):**
- `medusaIntegrationTestRunner` — boots full Medusa app (all modules + HTTP server); for HTTP tests and full-stack flows
- `moduleIntegrationTestRunner` — boots single module in isolation against real DB; for module service tests; faster, no HTTP layer
- Using the wrong runner either over-spins the stack or silently misses inter-module wiring

**Test Runner / Framework by Scope:**
- Backend unit + integration: Jest 29 + `@swc/jest` — `jest.mock()`, `jest.fn()`, `jest.spyOn()`
- Frontend: Vitest 3 — **scoped to `packages/admin/dashboard` only**; all other packages use Jest
- NEVER mix `vi.*` and `jest.*` — `jest.*` in Vitest = undefined; `vi.*` in Jest = import error
- Each backend package has its own `jest.config.js` — always run via `yarn workspace <pkg> test`, not from repo root

**Test Organization:**
- Unit tests: `__tests__/` directories alongside source, `.spec.ts` or `.test.ts` extensions
- Module integration tests: `packages/*/integration-tests/__tests__/`
- HTTP integration tests: `integration-tests/http/__tests__/`

**Integration Test Requirements:**
- Real PostgreSQL required — no mocking, no SQLite, no in-memory DB
- Required env vars: `DATABASE_URL` or `DB_HOST` + `DB_USERNAME` + `DB_PASSWORD` + `DB_NAME`
- CI must include a `services: postgres:` block (GitHub Actions)
- `getContainer()` is only valid inside `it()` / `beforeEach()` / `afterEach()` — NEVER at `describe()` scope or module top-level

**DB Isolation — common misunderstanding:**
- DB schemas are file-scoped (one schema per test file, created/dropped automatically) — do NOT manually create/drop schemas in `beforeAll`/`afterAll`
- Data is NOT automatically cleared between `it()` blocks — state leaks within a file cause order-dependent failures; handle teardown explicitly or structure tests to be order-independent
- `dbTestManager.setupDatabase()` in `beforeAll`; `dbTestManager.dropDatabase()` in `afterAll` — never in `beforeEach`

**Jest + @swc/jest Gotchas:**
- `@swc/jest` strips types without type-checking — green tests ≠ type-safe code; run `tsc --noEmit` separately
- `emitDecoratorMetadata` must mirror tsconfig in SWC config (`jsc.transform.decoratorMetadata: true`) — drift breaks decorator injection silently in tests only
- Do not use `ts-jest`; do not remove or simplify `transformIgnorePatterns` — several `node_modules` packages ship ESM-only and must be transformed by SWC (removing causes "Cannot use import statement" errors)
- `jest.setTimeout(300000)` is for integration test files only — unit test files use Jest default (5000ms)
- Snapshot generation is disabled during migration runs — do not assert on snapshot state in migration test suites

**HTTP Integration Test Patterns:**
- `api` (axios) and `getContainer` are injected by the runner into `testSuite` — do NOT import `api` separately
- `api` is unauthenticated by default — admin routes need token from `createAdminUser()` helper; store routes need a separate customer login flow; never use admin auth on store endpoints
- Use helpers from `integration-tests/helpers/create-admin-user.ts` for admin auth headers
- Use seeders from `integration-tests/http/fixtures/` as canonical payload templates — payloads must match the Zod schema used in `validateAndTransformBody()`; some seeders have ordering requirements (region → currency → product → order)
- Use `expect.assertions(n)` in async tests with conditional assertion paths — a swallowed `catch` produces a passing test that tested nothing

**Do NOT:**
- Mock Medusa module services in integration tests — defeats the purpose
- Call `beforeEach` for DB schema setup — causes duplicate schema errors
- Share container instances across `describe` blocks in different files
- Use `any` type casts to bypass response type checking in HTTP tests

### Code Quality & Style Rules

**File & Directory Naming:**
- Files: kebab-case (`define-config.ts`, `order-module-service.ts`)
- Test files: `my-service.spec.ts` or `my-service.test.ts`
- Route directories: kebab-case matching URL segment; dynamic segments use brackets: `[id]/route.ts`

**Naming Conventions:**
- Types / Interfaces / Classes: PascalCase
- Functions / Variables / Methods: camelCase
- Constants: SCREAMING_SNAKE_CASE
- DB column names (in decorator options): snake_case — TypeScript property names on entity classes are camelCase
- Protected `@InjectTransactionManager` counterpart of a public method: suffix `_` (e.g. `createOrder_`) — apply ONLY to this specific pattern, not all protected helpers

**HTTP Types & Enums Location:**
- HTTP request/response types live in `packages/core/types/src/http/` ONLY — never in module packages; naming: `AdminCreateOrder`, `AdminGetOrdersParams`, `StoreListProducts`
- Enums (`OrderStatus`, `ProductStatus`, `PaymentStatus`, etc.) are defined in `@medusajs/framework/utils` — import from there, never re-define locally

**Import & Export Patterns:**
- Path aliases (`@models`, `@types`, `@services`, `@repositories`, `@utils`) for intra-package imports — never use relative paths like `../../models/order`
- For cross-package imports: always import from the published package path (`@medusajs/framework/utils`), never from relative paths crossing package boundaries
- Barrel files (`index.ts`): `export * from "./file"` — no logic in barrel files, only re-exports; import from the barrel when consuming from another package
- Intra-module relative imports between sibling files are acceptable

**Comments & Documentation:**
- Add comments only when the WHY is non-obvious: a hidden constraint, a workaround, a surprising invariant
- Otherwise: no comments — well-named identifiers explain the code
- No "added for X flow" or "used by Y" comments — those belong in git history
- **Exception — TSDoc required on:** exported HTTP types in `packages/core/types/src/http/`, public module service interface methods, and exported workflow/step functions; use `/** ... */` TSDoc format

**Code Organization:**
- Modules self-contained; cross-module reads via `useQueryGraphStep()` in workflows or `container.resolve(ContainerRegistrationKeys.QUERY)` in steps; never direct cross-module service instantiation
- Route handlers must be thin: request shape validation (Zod) in `middlewares.ts` → business logic in workflows → data persistence in services; business rule validation ("cannot cancel completed order") belongs in workflow steps or services, NOT in middleware
- No logic in `index.ts` barrel files — only re-exports
- ESLint config is per-package (`packages/<pkg>/.eslintrc.js`) and CI-blocking; do not disable rules inline

### Development Workflow Rules

**Build System:**
- Build all packages: `yarn build` from repo root — Turborepo pipeline `{"build": {"dependsOn": ["^build"]}}` ensures upstream packages build first
- Build single package: `yarn workspace @medusajs/medusa build`
- After editing a type in one package, rebuild it before running tests in consumers — tests run against compiled `dist/`, not source
- Watch mode: `yarn watch` inside a package directory — not available in all packages; verify `watch` script exists in `package.json` first
- **Turborepo stale cache trap** — after significant cross-package type changes, clear cache: `yarn turbo run build --force` or `rm -rf .turbo`; stale cache passes local tests but fails CI

**Pre-Commit Checklist (before pushing any TypeScript changes):**
```bash
yarn tsc --noEmit          # type-check (separate from Jest — green tests ≠ type-safe)
yarn prettier --check .    # formatting check (auto-fix: yarn prettier --write .)
yarn test                  # unit tests for affected package
```

**Test Commands:**
- `yarn test` — all unit tests (no DB required)
- `yarn test:integration:packages` — package-level integration tests (requires PostgreSQL)
- `yarn test:integration:http` — HTTP integration tests (requires PostgreSQL)
- `yarn test:integration:api` — API integration tests (requires PostgreSQL)
- `yarn test:integration:modules` — module integration tests (requires PostgreSQL)
- Run single test file: `yarn jest --testPathPattern=packages/modules/order/src/__tests__/foo.spec.ts`
- Integration tests require env vars: `DATABASE_URL` or `DB_HOST`+`DB_USERNAME`+`DB_PASSWORD`+`DB_NAME`; also `DB_TEMP_NAME` for integration test `medusa-config.js` — running without these may affect the dev database

**Database:**
- Generate migrations: `yarn medusa db:generate <module-name>` — routes through Medusa's snapshot mechanism and module resolution
- Run migrations: `yarn medusa db:migrate`
- NEVER run `mikro-orm migration:create` directly — produces migrations with wrong entity paths, bypasses module container context
- After `db:generate`, check `git diff` for unexpected snapshot file changes — do NOT commit auto-generated snapshot files unless intentional

**Git & PR Conventions:**
- **Base branch for all PRs: `develop`** — NOT `main` or `master`
- Branch naming: `feature/`, `fix/`, `chore/`
- Commit messages: conventional commits — `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`, `ci:`
- Do not skip pre-commit hooks (`--no-verify`)
- **CODEOWNERS** — changes to `packages/core/**` require specific reviewer approvals; create targeted PRs for core changes and expect mandatory review gates
- Do NOT manually bump `package.json` versions — versioning is managed by the release pipeline (changesets); manual bumps conflict with CI

**Shared Dependencies (`packages/deps/`):**
- MikroORM 6.6.12, Awilix, Zod 4.2.0, pg are centralized in `packages/deps/`
- New module packages must resolve these through this shared layer — do NOT add direct installs of these packages in a new module's `package.json`

**Adding a New Module Package:**
Required files (use `packages/modules/api-key/` as reference):
1. `package.json` — with `name`, `version`, `main`, `exports`
2. `tsconfig.json` — must extend `../../_tsconfig.base.json` and declare `paths` aliases (`@models`, `@types`, `@services`, etc.)
3. `src/index.ts` — module entry point with `export default Module(Modules.X, { service: MyService })`
4. `jest.config.js` — per-package Jest config

Register the module via `defineConfig` in the app's `medusa-config.js` (entry point uses `defineConfig` from `@medusajs/utils`).

### Critical Don't-Miss Rules

**Silent Failures (no compile error, breaks at runtime):**
- `model.define("Name", ...)` entity name must exactly match the identifier in `joiner-config.ts`
- HTTP method exports must be UPPERCASE (`GET`, `POST`) — lowercase silently ignored by route loader
- `MedusaRequest<T>` vs `AuthenticatedMedusaRequest<T>` — wrong type compiles but fails auth middleware at runtime
- Missing `@MedusaContext() sharedContext: Context = {}` breaks transaction propagation across service layers
- `@InjectTransactionManager()` on a public method creates a nested transaction boundary causing subtle isolation bugs (not a hard failure) — use `@InjectManager()` on public methods, `@InjectTransactionManager()` on protected `_`-suffixed counterparts only
- `@EmitEvents()` must be outermost decorator (topmost in source) — decorators apply bottom-up; wrong order fires events before commit
- Duplicate workflow ID strings silently override — last import wins; no error thrown
- `emitDecoratorMetadata` mismatch between tsconfig and SWC config breaks DI in tests only — no compile error
- `createHook` subscribers run **after** the workflow completes, outside the transaction — transactional behavior must go in a step, not a hook subscriber

**Workflow Correctness:**
- `createWorkflow` function body must be **pure and synchronous** — no `async/await`, no `Date.now()`, no `Math.random()`, no direct I/O; the body runs multiple times during compensation; all side effects go inside steps
- `StepResponse(result, compensationData)` — omit `compensationData` and rollback is a silent no-op; compensation data must be plain serializable objects (no class instances)
- `transform()` must be pure sync — no async, no container access; violations compile locally but fail in distributed step execution with cryptic serialization errors
- `useQueryGraphStep` vs `useRemoteQueryStep` — NOT interchangeable; `useQueryGraphStep` runs inside the workflow transaction; `useRemoteQueryStep` does not; using the wrong one causes stale reads after mutations in the same workflow
- `useQueryGraphStep` excludes soft-deleted records by default — querying after a soft-delete in the same workflow returns stale/empty data
- Always test the compensation path explicitly: force a throw after the step under test and verify rollback behavior

**Zod v4 vs v3 (most LLM training data is v3):**
- `z.string().nonempty()` → use `z.string().min(1)`
- `z.object()` strips unknown keys by default in v4 (changed from v3) — use `.passthrough()` if full pass-through needed
- Import ONLY via `@medusajs/framework/zod` — direct `import { z } from "zod"` resolves a different transitive version
- Zod schemas belong in route `validators.ts` — never in workflow steps or module services

**Module Architecture Violations:**
- Never add foreign keys between modules inside model files — use `defineLink()` in `packages/links/`
- Never import another module's code directly in a module service — cross-module reads via `useQueryGraphStep()` in workflows or `container.resolve(ContainerRegistrationKeys.QUERY)` in steps
- `filterableFields` is only populated for query params explicitly listed in `allowedFilters` in `middlewares.ts` — new params not registered are silently dropped, no 400 error

**Admin UI Traps:**
- TanStack Query **v5**: no `onSuccess`/`onError` in `useQuery`, `cacheTime` → `gcTime`, query keys must be arrays
- React Router **v6**: no `useHistory`, no `<Switch>`, no `<Redirect>`
- Do not import Radix UI primitives directly — use `@medusajs/ui` exclusively
- `defineRouteConfig` export must be named `config` exactly — any other name is silently ignored by the plugin loader and the route never appears in the sidebar

**Test Traps:**
- MikroORM identity map caches entities within a transaction — call `em.clear()` between read-modify-read assertions
- DB teardown is truncation-based, not rollback-based — do not assume automatic cleanup between `it()` blocks
- `@EmitEvents()` fires post-commit — assert on emitted events after the async boundary, not immediately after the service call
- `vi.mock()` hoisting differs from `jest.mock()` — do not port tests between Vitest and Jest without verifying mock application order

**Build / CI Traps:**
- Turborepo stale cache can serve wrong compiled output — run `yarn turbo run build --force` or `rm -rf .turbo` after cross-package type changes
- Tests run against `dist/` not source — rebuild packages before running tests in consuming packages
- `tsc --noEmit` and `prettier --check` run separately from Jest in CI — green tests do not mean clean CI
- All PRs target `develop` branch — NOT `main` or `master`
- Workspace packages must be in both `peerDependencies` AND `devDependencies` — deps-only causes duplicate DI class instances at runtime; `instanceof` checks fail silently
- `yarn medusa db:generate` requires the DB to be in sync with the current model state — run `db:sync` first; generating against an out-of-sync DB produces corrupt migrations

---

## Usage Guidelines

**For AI Agents:**
- Read this file before implementing any code in this project
- Follow ALL rules exactly as documented — prefer the more restrictive option when in doubt
- Framework imports must come from re-export paths, not direct packages
- When adding new patterns, check if they conflict with any rule here

**For Humans:**
- Keep this file lean and focused on unobvious agent needs
- Update when technology stack changes (versions, new packages, new patterns)
- Review quarterly for outdated rules
- Remove rules that become obvious over time

Last Updated: 2026-05-14
