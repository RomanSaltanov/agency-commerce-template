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

type OrderDeliveredEmailProps = {
  order: {
    display_id: number
    email: string
    shipping_address?: {
      first_name?: string
    }
  }
  fulfillment: {
    id: string
  }
}

function OrderDeliveredEmailComponent({ order }: OrderDeliveredEmailProps) {
  const firstName = order.shipping_address?.first_name || ""

  return (
    <Html>
      <Head />
      <Preview>Your order #{order.display_id} has been delivered!</Preview>
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f4f4f5", margin: 0 }}>
        <Container style={{ maxWidth: "600px", margin: "40px auto", backgroundColor: "#fff", borderRadius: "8px", overflow: "hidden" }}>
          <Section style={{ backgroundColor: "#18181b", padding: "20px 24px" }}>
            <Text style={{ color: "#fff", margin: 0, fontWeight: "bold", fontSize: "16px" }}>
              Aldevon Store
            </Text>
          </Section>

          <Section style={{ padding: "32px 24px" }}>
            <Heading style={{ fontSize: "22px", fontWeight: "bold", color: "#18181b", margin: "0 0 8px" }}>
              {firstName ? `Your order arrived, ${firstName}!` : "Your order has been delivered!"}
            </Heading>
            <Text style={{ color: "#71717a", fontSize: "14px", margin: "0 0 16px" }}>
              Order #{order.display_id} · Your order has been delivered. We hope you enjoy your purchase!
            </Text>
            <Text style={{ color: "#71717a", fontSize: "14px", margin: 0 }}>
              If you have any issues with your order, please don&apos;t hesitate to contact us.
            </Text>
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

export const orderDeliveredEmail = (props: OrderDeliveredEmailProps) => (
  <OrderDeliveredEmailComponent {...props} />
)
