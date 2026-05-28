import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { listCollections } from "@lib/data/collections"
import { listCategories } from "@lib/data/categories"
import { listProductsWithSort } from "@lib/data/products"

import PaginatedProducts from "./paginated-products"

const StoreTemplate = async ({
  sortBy,
  page,
  countryCode,
  categoryHandle,
  collectionHandle,
  colorFilter,
  sizeFilter,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
  categoryHandle?: string
  collectionHandle?: string
  colorFilter?: string
  sizeFilter?: string
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  const [{ collections }, categories, allProducts] = await Promise.all([
    listCollections({ fields: "id,title,handle" }),
    listCategories(),
    listProductsWithSort({
      page: 1,
      queryParams: { limit: 100, fields: "*options" },
      countryCode,
    }),
  ])

  const categoryId = categories?.find((c) => c.handle === categoryHandle)?.id
  const collectionId = collections?.find((c) => c.handle === collectionHandle)?.id

  // Collect unique option values for Color and Size
  const colorValues = new Set<string>()
  const sizeValues = new Set<string>()

  allProducts.response.products.forEach((p) => {
    p.options?.forEach((opt: any) => {
      const title = opt.title?.toLowerCase()
      opt.values?.forEach((v: any) => {
        const vals = v.value?.split(",").map((s: string) => s.trim()) || []
        vals.forEach((val: string) => {
          if (val) {
            if (title === "color" || title === "colour") colorValues.add(val)
            if (title === "size") sizeValues.add(val)
          }
        })
      })
    })
  })

  return (
    <div
      className="flex flex-col py-6 content-container"
      data-testid="category-container"
    >
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl-semi" data-testid="store-page-title">
          All products
        </h1>
      </div>

      <RefinementList
        sortBy={sort}
        categories={categories || []}
        collections={collections || []}
        colors={Array.from(colorValues)}
        sizes={Array.from(sizeValues)}
      />

      <Suspense fallback={<SkeletonProductGrid />}>
        <PaginatedProducts
          sortBy={sort}
          page={pageNumber}
          countryCode={countryCode}
          categoryId={categoryId}
          collectionId={collectionId}
          colorFilter={colorFilter}
          sizeFilter={sizeFilter}
        />
      </Suspense>
    </div>
  )
}

export default StoreTemplate
