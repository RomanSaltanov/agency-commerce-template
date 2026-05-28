import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { INotificationModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

type PasswordResetEventData = {
  entity_id: string
  token: string
  actorType: string
}

export default async function customerPasswordResetHandler({
  event: { data },
  container,
}: SubscriberArgs<PasswordResetEventData>) {
  const notificationModule: INotificationModuleService = container.resolve(
    Modules.NOTIFICATION
  )

  const storefrontUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://shop.aldevon.co.uk"
  const resetLink = `${storefrontUrl}/account/reset-password?token=${data.token}&email=${encodeURIComponent(data.entity_id)}`

  await notificationModule.createNotifications({
    to: data.entity_id,
    channel: "email",
    template: "password-reset",
    data: {
      resetLink,
    },
  })
}

export const config: SubscriberConfig = {
  event: "auth.password_reset",
}
