import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components"
import * as React from "react"

type OrderFulfillmentCreatedEmailProps = {
  order: {
    display_id: number
    email: string
    shipping_address?: {
      first_name?: string
      last_name?: string
      address_1?: string
      city?: string
      postal_code?: string
      country_code?: string
    }
  }
  fulfillment: {
    id: string
  }
}

function OrderFulfillmentCreatedEmailComponent({ order }: OrderFulfillmentCreatedEmailProps) {
  const firstName = order.shipping_address?.first_name || ""

  return (
    <Html>
      <Head />
      <Preview>Your order #{order.display_id} is being prepared</Preview>
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f4f4f5", margin: 0 }}>
        <Container style={{ maxWidth: "600px", margin: "40px auto", backgroundColor: "#fff", borderRadius: "8px", overflow: "hidden" }}>
          <Section style={{ backgroundColor: "#18181b", padding: "20px 24px" }}>
            <Text style={{ color: "#fff", margin: 0, fontWeight: "bold", fontSize: "16px" }}>
              Aldevon Store
            </Text>
          </Section>

          <Section style={{ padding: "32px 24px" }}>
            <Heading style={{ fontSize: "22px", fontWeight: "bold", color: "#18181b", margin: "0 0 8px" }}>
              {firstName ? `Great news, ${firstName}!` : "Your order is being prepared!"}
            </Heading>
            <Text style={{ color: "#71717a", fontSize: "14px", margin: "0 0 16px" }}>
              Order #{order.display_id} · We&apos;re preparing your order for shipment. You&apos;ll receive another email with tracking information once it ships.
            </Text>

            {order.shipping_address && (
              <>
                <Text style={{ fontWeight: "600", fontSize: "14px", color: "#18181b", marginBottom: "8px" }}>
                  Shipping to
                </Text>
                <Text style={{ margin: 0, fontSize: "13px", color: "#71717a", lineHeight: "1.6" }}>
                  {order.shipping_address.first_name} {order.shipping_address.last_name}<br />
                  {order.shipping_address.address_1}<br />
                  {order.shipping_address.city}, {order.shipping_address.postal_code}<br />
                  {order.shipping_address.country_code?.toUpperCase()}
                </Text>
              </>
            )}
          </Section>

          <Section style={{ backgroundColor: "#f9f9f9", padding: "20px 24px" }}>
            <Text style={{ margin: 0, fontSize: "12px", color: "#a1a1aa", textAlign: "center" }}>
              Questions? Contact us at{" "}
              <a href="mailto:info@aldevon.co.uk" style={{ color: "#71717a" }}>info@aldevon.co.uk</a>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export const orderFulfillmentCreatedEmail = (props: OrderFulfillmentCreatedEmailProps) => (
  <OrderFulfillmentCreatedEmailComponent {...props} />
)
