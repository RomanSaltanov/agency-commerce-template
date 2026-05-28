import { listProductsWithSort } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "@modules/store/components/pagination"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

const PRODUCT_LIMIT = 12

type PaginatedProductsParams = {
  limit: number
  collection_id?: string[]
  category_id?: string[]
  id?: string[]
  order?: string
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
}: {
  sortBy?: SortOptions
  page: number
  collectionId?: string
  categoryId?: string
  productsIds?: string[]
  countryCode: string
  colorFilter?: string
  sizeFilter?: string
}) {
  const queryParams: PaginatedProductsParams = {
    limit: colorFilter || sizeFilter ? 100 : 12,
  }

  if (collectionId) {
    queryParams["collection_id"] = [collectionId]
  }

  if (categoryId) {
    queryParams["category_id"] = [categoryId]
  }

  if (productsIds) {
    queryParams["id"] = productsIds
  }

  if (sortBy === "created_at") {
    queryParams["order"] = "created_at"
  }

  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  let {
    response: { products, count },
  } = await listProductsWithSort({
    page,
    queryParams,
    sortBy,
    countryCode,
  })

  // Client-side filter by color/size option values
  if (colorFilter) {
    products = products.filter((p) =>
      p.options?.some((opt: any) => {
        const title = opt.title?.toLowerCase()
        return (
          (title === "color" || title === "colour") &&
          opt.values?.some((v: any) =>
            v.value
              ?.split(",")
              .map((s: string) => s.trim())
              .includes(colorFilter)
          )
        )
      })
    )
  }

  if (sizeFilter) {
    products = products.filter((p) =>
      p.options?.some((opt: any) => {
        const title = opt.title?.toLowerCase()
        return (
          title === "size" &&
          opt.values?.some((v: any) =>
            v.value
              ?.split(",")
              .map((s: string) => s.trim())
              .includes(sizeFilter)
          )
        )
      })
    )
  }

  const filteredCount = products.length
  const totalPages = Math.ceil(
    (colorFilter || sizeFilter ? filteredCount : count) / PRODUCT_LIMIT
  )

  const paginatedProducts =
    colorFilter || sizeFilter
      ? products.slice((page - 1) * PRODUCT_LIMIT, page * PRODUCT_LIMIT)
      : products

  return (
    <>
      <ul
        className="grid grid-cols-2 w-full small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8"
        data-testid="products-list"
      >
        {paginatedProducts.map((p) => (
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
