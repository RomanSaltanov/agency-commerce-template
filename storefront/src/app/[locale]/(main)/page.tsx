import { Metadata } from "next"

import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"

export const metadata: Metadata = {
  title: "Aldevon Store",
  description: "Premium fashion and clothing store.",
}

export default async function Home(props: {
  params: Promise<{ locale: string }>
}) {
  const params = await props.params

  const { locale } = params

  const region = await getRegion(process.env.NEXT_PUBLIC_DEFAULT_REGION || "gb")

  const { collections } = await listCollections({
    fields: "id, handle, title",
  })

  if (!collections || !region) {
    return null
  }

  const collectionsWithProducts = await Promise.all(
    collections.map(async (collection) => ({
      collection,
      products: (
        await listProducts({
          regionId: region.id,
          queryParams: {
            collection_id: collection.id,
            fields: "*variants.calculated_price",
            limit: 6,
          },
        })
      ).response.products,
    }))
  )

  return (
    <>
      <Hero />
      <div className="py-12">
        <ul className="flex flex-col gap-x-6">
          <FeaturedProducts collectionsWithProducts={collectionsWithProducts} region={region} />
        </ul>
      </div>
    </>
  )
}
