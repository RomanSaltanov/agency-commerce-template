import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "@modules/store/components/pagination"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

const PRODUCT_LIMIT = 12

type PaginatedProductsParams = {
  limit: number
  offset: number
  collection_id?: string[]
  category_id?: string[]
  id?: string[]
  order?: string
}

type FilterOptions = {
  colors: string[]
  sizes: string[]
  productsByColor: Record<string, string[]>
  productsBySize: Record<string, string[]>
}

export default async function PaginatedProducts({
  sortBy,
  page,
  collectionId,
  categoryId,
  productsIds,
  countryCode,
  colorFilter,
  sizeFilter,
  filterOptions,
}: {
  sortBy?: SortOptions
  page: number
  collectionId?: string
  categoryId?: string
  productsIds?: string[]
  countryCode: string
  colorFilter?: string
  sizeFilter?: string
  filterOptions?: FilterOptions
}) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  // Resolve matching product IDs from pre-fetched filter options (no extra API call)
  let filteredIds: string[] | undefined

  if ((colorFilter || sizeFilter) && filterOptions) {
    let colorIds = colorFilter ? filterOptions.productsByColor[colorFilter] ?? [] : null
    let sizeIds = sizeFilter ? filterOptions.productsBySize[sizeFilter] ?? [] : null

    if (colorIds && sizeIds) {
      const sizeSet = new Set(sizeIds)
      filteredIds = colorIds.filter((id) => sizeSet.has(id))
    } else {
      filteredIds = colorIds ?? sizeIds ?? []
    }
  }

  const offset = (page - 1) * PRODUCT_LIMIT

  const queryParams: PaginatedProductsParams = {
    limit: PRODUCT_LIMIT,
    offset,
  }

  if (filteredIds !== undefined) {
    queryParams["id"] = filteredIds.length ? filteredIds : ["__none__"]
  } else {
    if (collectionId) queryParams["collection_id"] = [collectionId]
    if (categoryId) queryParams["category_id"] = [categoryId]
    if (productsIds) queryParams["id"] = productsIds
  }

  const sortToOrder: Record<SortOptions, string | undefined> = {
    created_at: "-created_at",
    price_asc: undefined,
    price_desc: undefined,
  }

  if (sortBy && sortToOrder[sortBy]) {
    queryParams["order"] = sortToOrder[sortBy]
  }

  const {
    response: { products, count },
  } = await listProducts({
    pageParam: 1,
    queryParams: {
      ...queryParams,
      fields:
        "*variants.calculated_price,+variants.inventory_quantity,*variants.images,+metadata,+tags",
    },
    countryCode,
  })

  // Price sorting must remain client-side (API doesn't support it)
  let displayProducts = products
  if (sortBy === "price_asc") {
    displayProducts = [...products].sort((a, b) => {
      const aPrice = Math.min(...(a.variants?.map((v) => v.calculated_price?.calculated_amount ?? Infinity) ?? [Infinity]))
      const bPrice = Math.min(...(b.variants?.map((v) => v.calculated_price?.calculated_amount ?? Infinity) ?? [Infinity]))
      return aPrice - bPrice
    })
  } else if (sortBy === "price_desc") {
    displayProducts = [...products].sort((a, b) => {
      const aPrice = Math.min(...(a.variants?.map((v) => v.calculated_price?.calculated_amount ?? Infinity) ?? [Infinity]))
      const bPrice = Math.min(...(b.variants?.map((v) => v.calculated_price?.calculated_amount ?? Infinity) ?? [Infinity]))
      return bPrice - aPrice
    })
  }

  const totalCount = filteredIds !== undefined ? filteredIds.length : count
  const totalPages = Math.ceil(totalCount / PRODUCT_LIMIT)

  return (
    <>
      <ul
        className="grid grid-cols-2 w-full small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8"
        data-testid="products-list"
      >
        {displayProducts.map((p) => (
          <li key={p.id}>
            <ProductPreview product={p} region={region} />
          </li>
        ))}
      </ul>
      {totalPages > 1 && (
        <Pagination
          data-testid="product-pagination"
          page={page}
          totalPages={totalPages}
        />
      )}
    </>
  )
}
