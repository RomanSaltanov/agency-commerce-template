import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { INotificationModuleService } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

function serializeBigNumbers(obj: any): any {
  if (obj === null || obj === undefined) return obj
  if (typeof obj === "number" || typeof obj === "string" || typeof obj === "boolean") return obj
  if (typeof obj === "object") {
    if ("bignumber_" in obj) {
      return typeof obj.numeric_ === "number" ? obj.numeric_ : parseFloat(String(obj.raw_ ?? 0))
    }
    if (Array.isArray(obj)) return obj.map(serializeBigNumbers)
    const result: any = {}
    for (const key of Object.keys(obj)) {
      result[key] = serializeBigNumbers(obj[key])
    }
    return result
  }
  return obj
}

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const notificationModule: INotificationModuleService = container.resolve(
    Modules.NOTIFICATION
  )

  const { data: orders } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "display_id",
      "email",
      "currency_code",
      "item_total",
      "shipping_total",
      "tax_total",
      "total",
      "items.*",
      "items.variant.*",
      "shipping_address.*",
      "shipping_methods.*",
    ],
    filters: { id: data.id },
  })

  const order = orders[0]
  if (!order || !order.email) return

  await notificationModule.createNotifications({
    to: order.email,
    channel: "email",
    template: "order-placed",
    data: { order: serializeBigNumbers(order) },
  })
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
