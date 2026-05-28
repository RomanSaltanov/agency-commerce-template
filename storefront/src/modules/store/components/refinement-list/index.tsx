"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { SortOptions } from "./sort-products"

type Category = { id: string; name: string; handle: string }
type Collection = { id: string; title: string; handle: string }

type RefinementListProps = {
  sortBy: SortOptions
  categories?: Category[]
  collections?: Collection[]
  colors?: string[]
  sizes?: string[]
  "data-testid"?: string
}

const RefinementList = ({
  sortBy,
  categories = [],
  collections = [],
  colors = [],
  sizes = [],
  "data-testid": dataTestId,
}: RefinementListProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createQueryString = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams)
      Object.entries(updates).forEach(([name, value]) => {
        if (value) {
          params.set(name, value)
        } else {
          params.delete(name)
        }
      })
      return params.toString()
    },
    [searchParams]
  )

  const setQueryParams = (name: string, value: string) => {
    const query = createQueryString({ [name]: value })
    router.push(`${pathname}?${query}`)
  }

  const currentSort = sortBy
  const currentCategory = searchParams.get("category") || ""
  const currentCollection = searchParams.get("collection") || ""
  const currentColor = searchParams.get("color") || ""
  const currentSize = searchParams.get("size") || ""

  const hasFilters =
    currentCategory ||
    currentCollection ||
    currentColor ||
    currentSize ||
    currentSort !== "created_at"

  return (
    <div
      className="flex flex-wrap items-center gap-3 py-4 mb-6 w-full"
      data-testid={dataTestId}
    >
      {/* Sort */}
      <select
        value={currentSort}
        onChange={(e) => setQueryParams("sortBy", e.target.value)}
        className="border border-ui-border-base rounded-md px-3 py-2 text-sm text-ui-fg-base bg-white hover:border-ui-border-interactive focus:outline-none cursor-pointer"
      >
        <option value="created_at">Latest Arrivals</option>
        <option value="price_asc">Price: Low → High</option>
        <option value="price_desc">Price: High → Low</option>
      </select>

      {/* Categories */}
      {categories.length > 0 && (
        <select
          value={currentCategory}
          onChange={(e) => setQueryParams("category", e.target.value)}
          className="border border-ui-border-base rounded-md px-3 py-2 text-sm text-ui-fg-base bg-white hover:border-ui-border-interactive focus:outline-none cursor-pointer"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.handle}>
              {c.name}
            </option>
          ))}
        </select>
      )}

      {/* Collections */}
      {collections.length > 0 && (
        <select
          value={currentCollection}
          onChange={(e) => setQueryParams("collection", e.target.value)}
          className="border border-ui-border-base rounded-md px-3 py-2 text-sm text-ui-fg-base bg-white hover:border-ui-border-interactive focus:outline-none cursor-pointer"
        >
          <option value="">All Collections</option>
          {collections.map((c) => (
            <option key={c.id} value={c.handle}>
              {c.title}
            </option>
          ))}
        </select>
      )}

      {/* Color */}
      {colors.length > 0 && (
        <select
          value={currentColor}
          onChange={(e) => setQueryParams("color", e.target.value)}
          className="border border-ui-border-base rounded-md px-3 py-2 text-sm text-ui-fg-base bg-white hover:border-ui-border-interactive focus:outline-none cursor-pointer"
        >
          <option value="">All Colors</option>
          {colors.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      )}

      {/* Size */}
      {sizes.length > 0 && (
        <select
          value={currentSize}
          onChange={(e) => setQueryParams("size", e.target.value)}
          className="border border-ui-border-base rounded-md px-3 py-2 text-sm text-ui-fg-base bg-white hover:border-ui-border-interactive focus:outline-none cursor-pointer"
        >
          <option value="">All Sizes</option>
          {sizes.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      )}

      {/* Clear filters */}
      {hasFilters && (
        <button
          onClick={() => router.push(pathname)}
          className="text-sm text-ui-fg-subtle hover:text-ui-fg-base underline"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}

export default RefinementList
