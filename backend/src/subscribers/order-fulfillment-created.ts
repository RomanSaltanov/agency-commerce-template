import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { INotificationModuleService } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

const EVENT_TEMPLATE_MAP: Record<string, string> = {
  "order.fulfillment_created": "order-fulfillment-created",
  "shipment.created": "order-shipped",
  "delivery.created": "order-delivered",
}

export default async function orderFulfillmentCreatedHandler({
  event: { data, name },
  container,
}: SubscriberArgs<{ id?: string; fulfillment_id?: string; order_id?: string; no_notification?: boolean }>) {
  if (data.no_notification) return

  const fulfillmentId = data.id || data.fulfillment_id
  if (!fulfillmentId) return

  const template = EVENT_TEMPLATE_MAP[name]
  if (!template) return

  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const notificationModule: INotificationModuleService = container.resolve(
    Modules.NOTIFICATION
  )

  const { data: fulfillments } = await query.graph({
    entity: "fulfillment",
    fields: [
      "id",
      "order_id",
      "tracking_links.*",
      "items.*",
    ],
    filters: { id: fulfillmentId },
  })

  const fulfillment = fulfillments[0]
  if (!fulfillment) return

  const orderId = data.order_id || fulfillment.order_id
  if (!orderId) return

  const { data: orders } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "display_id",
      "email",
      "currency_code",
      "shipping_address.*",
    ],
    filters: { id: orderId },
  })

  const order = orders[0]
  if (!order || !order.email) return

  await notificationModule.createNotifications({
    to: order.email,
    channel: "email",
    template,
    data: { order, fulfillment },
  })
}

export const config: SubscriberConfig = {
  event: [
    "order.fulfillment_created",
    "shipment.created",
    "delivery.created",
  ],
}
