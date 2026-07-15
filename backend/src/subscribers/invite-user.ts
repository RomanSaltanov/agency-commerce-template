import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { INotificationModuleService, IUserModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

type InviteEventData = {
  id: string
}

export default async function inviteUserHandler({
  event: { data },
  container,
}: SubscriberArgs<InviteEventData>) {
  const notificationModule: INotificationModuleService = container.resolve(
    Modules.NOTIFICATION
  )
  const userModule: IUserModuleService = container.resolve(Modules.USER)

  const [invite] = await userModule.listInvites({ id: [data.id] })

  if (!invite) {
    return
  }

  const adminUrl = process.env.MEDUSA_BACKEND_URL || "https://api-dev.aldevon.co.uk"
  const inviteLink = `${adminUrl}/app/invite?token=${invite.token}`

  await notificationModule.createNotifications({
    to: invite.email,
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
