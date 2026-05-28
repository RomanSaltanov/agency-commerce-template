import { Suspense } from "react"

import { listRegions } from "@lib/data/regions"
import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"

export default async function Nav() {
  const [regions, locales, currentLocale] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    getLocale(),
  ])

  return (
    <div className="sticky top-0 inset-x-0 z-50">
      <header className="h-16 bg-white border-b border-ui-border-base">
        <nav className="content-container flex items-center justify-between w-full h-full text-sm">
          {/* Logo */}
          <LocalizedClientLink
            href="/"
            className="text-base font-semibold uppercase tracking-widest hover:text-ui-fg-base"
            data-testid="nav-store-link"
          >
            Medusa Store
          </LocalizedClientLink>

          {/* Center links */}
          <div className="flex items-center gap-x-8">
            <LocalizedClientLink
              href="/store"
              className="text-ui-fg-subtle hover:text-ui-fg-base transition-colors"
            >
              Shop
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/collections/new-arrivals"
              className="text-ui-fg-subtle hover:text-ui-fg-base transition-colors"
            >
              New Arrivals
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/collections/sale"
              className="text-ui-fg-subtle hover:text-ui-fg-base transition-colors"
            >
              Sale
            </LocalizedClientLink>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-x-6">
            <LocalizedClientLink
              href="/account"
              className="text-ui-fg-subtle hover:text-ui-fg-base transition-colors"
              data-testid="nav-account-link"
            >
              Account
            </LocalizedClientLink>
            <Suspense
              fallback={
                <LocalizedClientLink
                  href="/cart"
                  className="text-ui-fg-subtle hover:text-ui-fg-base transition-colors"
                  data-testid="nav-cart-link"
                >
                  Cart (0)
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>
    </div>
  )
}
