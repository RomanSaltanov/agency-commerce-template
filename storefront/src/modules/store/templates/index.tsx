import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { listCollections } from "@lib/data/collections"
import { listCategories } from "@lib/data/categories"

import PaginatedProducts from "./paginated-products"

const StoreTemplate = async ({
  sortBy,
  page,
  countryCode,
  categoryHandle,
  collectionHandle,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
  categoryHandle?: string
  collectionHandle?: string
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  const [{ collections }, categories] = await Promise.all([
    listCollections({ fields: "id,title,handle" }),
    listCategories(),
  ])

  const categoryId = categories?.find((c) => c.handle === categoryHandle)?.id
  const collectionId = collections?.find((c) => c.handle === collectionHandle)?.id

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
      />

      <Suspense fallback={<SkeletonProductGrid />}>
        <PaginatedProducts
          sortBy={sort}
          page={pageNumber}
          countryCode={countryCode}
          categoryId={categoryId}
          collectionId={collectionId}
        />
      </Suspense>
    </div>
  )
}

export default StoreTemplate
