import { Metadata } from "next"

import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"


export const metadata: Metadata = {
  title: "Store",
  description: "Explore all of our products.",
}

type Params = {
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
    category?: string
    collection?: string
    color?: string
    size?: string
  }>
  params: Promise<{
    locale: string
  }>
}

export default async function StorePage(props: Params) {
  const searchParams = await props.searchParams
  const { sortBy, page, category, collection, color, size } = searchParams

  return (
    <StoreTemplate
      sortBy={sortBy}
      page={page}
      countryCode={process.env.NEXT_PUBLIC_DEFAULT_REGION || "gb"}
      categoryHandle={category}
      collectionHandle={collection}
      colorFilter={color}
      sizeFilter={size}
    />
  )
}
