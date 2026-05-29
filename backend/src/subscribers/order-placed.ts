import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { INotificationModuleService } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

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
    data: { order },
  })
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
