import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"

const STOREFRONT_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://shop.aldevon.co.uk"
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET || ""

async function revalidate(tags: string[]) {
  if (!REVALIDATE_SECRET) return

  try {
    await fetch(`${STOREFRONT_URL}/api/revalidate?secret=${REVALIDATE_SECRET}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags }),
    })
  } catch (e) {
    console.error("[revalidate] Failed to revalidate storefront:", e)
  }
}

export default async function storefrontRevalidateSubscriber({
  event,
}: SubscriberArgs<any>) {
  const { name } = event

  if (name.startsWith("product")) {
    await revalidate(["products"])
  } else if (name.startsWith("product-collection")) {
    await revalidate(["collections", "products"])
  } else if (name.startsWith("product-category")) {
    await revalidate(["categories", "products"])
  }
}

export const config: SubscriberConfig = {
  event: [
    "product.created",
    "product.updated",
    "product.deleted",
    "product-variant.created",
    "product-variant.updated",
    "product-variant.deleted",
    "product-collection.created",
    "product-collection.updated",
    "product-collection.deleted",
    "product-category.created",
    "product-category.updated",
    "product-category.deleted",
  ],
}
