import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components"
import * as React from "react"

type OrderShippedEmailProps = {
  order: {
    display_id: number
    email: string
    currency_code: string
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
    tracking_links?: { tracking_number: string; url?: string }[]
    items?: { title: string; quantity: number }[]
  }
}

function OrderShippedEmailComponent({ order, fulfillment }: OrderShippedEmailProps) {
  const firstName = order.shipping_address?.first_name || ""
  const trackingLinks = fulfillment.tracking_links || []

  return (
    <Html>
      <Head />
      <Preview>Your order #{order.display_id} has been shipped!</Preview>
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f4f4f5", margin: 0 }}>
        <Container style={{ maxWidth: "600px", margin: "40px auto", backgroundColor: "#fff", borderRadius: "8px", overflow: "hidden" }}>
          <Section style={{ backgroundColor: "#18181b", padding: "20px 24px" }}>
            <Text style={{ color: "#fff", margin: 0, fontWeight: "bold", fontSize: "16px" }}>
              Aldevon Store
            </Text>
          </Section>

          <Section style={{ padding: "32px 24px 0" }}>
            <Heading style={{ fontSize: "22px", fontWeight: "bold", color: "#18181b", margin: "0 0 8px" }}>
              {firstName ? `Your order is on its way, ${firstName}!` : "Your order has been shipped!"}
            </Heading>
            <Text style={{ color: "#71717a", fontSize: "14px", margin: 0 }}>
              Order #{order.display_id} · Your order has been fulfilled and is on its way to you.
            </Text>
          </Section>

          {trackingLinks.length > 0 && (
            <Section style={{ padding: "24px" }}>
              <Text style={{ fontWeight: "600", fontSize: "14px", color: "#18181b", marginBottom: "8px" }}>
                Tracking information
              </Text>
              {trackingLinks.map((link, i) => (
                <Row key={i}>
                  <Column>
                    <Text style={{ margin: "4px 0", fontSize: "13px", color: "#71717a" }}>
                      Tracking number:{" "}
                      {link.url ? (
                        <a href={link.url} style={{ color: "#18181b", fontWeight: "500" }}>
                          {link.tracking_number}
                        </a>
                      ) : (
                        <span style={{ color: "#18181b", fontWeight: "500" }}>{link.tracking_number}</span>
                      )}
                    </Text>
                  </Column>
                </Row>
              ))}
            </Section>
          )}

          {order.shipping_address && (
            <Section style={{ padding: "0 24px 24px" }}>
              <Text style={{ fontWeight: "600", fontSize: "14px", color: "#18181b", marginBottom: "8px" }}>
                Shipping to
              </Text>
              <Text style={{ margin: 0, fontSize: "13px", color: "#71717a", lineHeight: "1.6" }}>
                {order.shipping_address.first_name} {order.shipping_address.last_name}<br />
                {order.shipping_address.address_1}<br />
                {order.shipping_address.city}, {order.shipping_address.postal_code}<br />
                {order.shipping_address.country_code?.toUpperCase()}
              </Text>
            </Section>
          )}

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

export const orderShippedEmail = (props: OrderShippedEmailProps) => (
  <OrderShippedEmailComponent {...props} />
)
