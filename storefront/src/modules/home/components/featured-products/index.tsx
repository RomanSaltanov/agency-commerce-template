import { HttpTypes } from "@medusajs/types"
import ProductRail from "@modules/home/components/featured-products/product-rail"

export default function FeaturedProducts({
  collectionsWithProducts,
  region,
}: {
  collectionsWithProducts: {
    collection: HttpTypes.StoreCollection
    products: HttpTypes.StoreProduct[]
  }[]
  region: HttpTypes.StoreRegion
}) {
  return collectionsWithProducts.map(({ collection, products }) => (
    <li key={collection.id}>
      <ProductRail collection={collection} products={products} region={region} />
    </li>
  ))
}
