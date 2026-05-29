import { AbstractNotificationProviderService, MedusaError } from "@medusajs/framework/utils"
import {
  Logger,
  ProviderSendNotificationDTO,
  ProviderSendNotificationResultsDTO,
} from "@medusajs/framework/types"
import { Resend, CreateEmailOptions } from "resend"
import * as React from "react"
import { passwordResetEmail } from "./emails/password-reset"
import { orderPlacedEmail } from "./emails/order-placed"

type ResendOptions = {
  api_key: string
  from: string
  html_templates?: Record<string, { subject?: string; content: string }>
}

type InjectedDependencies = {
  logger: Logger
}

enum Templates {
  PASSWORD_RESET = "password-reset",
  ORDER_PLACED = "order-placed",
}

const templates: { [key in Templates]?: (props: unknown) => React.ReactNode } = {
  [Templates.PASSWORD_RESET]: passwordResetEmail as (props: unknown) => React.ReactNode,
  [Templates.ORDER_PLACED]: orderPlacedEmail as (props: unknown) => React.ReactNode,
}

class ResendNotificationProviderService extends AbstractNotificationProviderService {
  static identifier = "notification-resend"
  private resendClient: Resend
  private options: ResendOptions
  private logger: Logger

  constructor({ logger }: InjectedDependencies, options: ResendOptions) {
    super()
    this.resendClient = new Resend(options.api_key)
    this.options = options
    this.logger = logger
  }

  static validateOptions(options: Record<string, unknown>) {
    if (!options.api_key) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Option `api_key` is required in the Resend provider's options."
      )
    }
    if (!options.from) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Option `from` is required in the Resend provider's options."
      )
    }
  }

  private getTemplate(template: Templates) {
    if (this.options.html_templates?.[template]) {
      return this.options.html_templates[template].content
    }
    return templates[template] ?? null
  }

  private getTemplateSubject(template: Templates): string {
    if (this.options.html_templates?.[template]?.subject) {
      return this.options.html_templates[template].subject!
    }
    switch (template) {
      case Templates.PASSWORD_RESET:
        return "Reset your password"
      case Templates.ORDER_PLACED:
        return "Order confirmed"
      default:
        return "Notification"
    }
  }

  async send(
    notification: ProviderSendNotificationDTO
  ): Promise<ProviderSendNotificationResultsDTO> {
    const template = this.getTemplate(notification.template as Templates)

    if (!template) {
      this.logger.error(
        `No email template found for "${notification.template}". Valid options: ${Object.values(Templates).join(", ")}`
      )
      return {}
    }

    const commonOptions = {
      from: this.options.from,
      to: [notification.to],
      subject: this.getTemplateSubject(notification.template as Templates),
    }

    let emailOptions: CreateEmailOptions
    if (typeof template === "string") {
      emailOptions = { ...commonOptions, html: template }
    } else {
      emailOptions = {
        ...commonOptions,
        react: template(notification.data) as React.ReactElement,
      }
    }

    const { data, error } = await this.resendClient.emails.send(emailOptions)

    if (error || !data) {
      this.logger.error(`Failed to send email via Resend: ${error ? JSON.stringify(error) : "unknown error"}`)
      return {}
    }

    return { id: data.id }
  }
}

export default ResendNotificationProviderService
