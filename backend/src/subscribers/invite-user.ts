import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { INotificationModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

type InviteEventData = {
  id: string
  token: string
  email: string
}

export default async function inviteUserHandler({
  event: { data },
  container,
}: SubscriberArgs<InviteEventData>) {
  const notificationModule: INotificationModuleService = container.resolve(
    Modules.NOTIFICATION
  )

  const adminUrl = process.env.MEDUSA_BACKEND_URL || "https://api-dev.aldevon.co.uk"
  const inviteLink = `${adminUrl}/app/invite?token=${data.token}`

  await notificationModule.createNotifications({
    to: data.email,
    channel: "email",
    template: "invite-user",
    data: {
      inviteLink,
    },
  })
}

export const config: SubscriberConfig = {
  event: "invite.created",
}
