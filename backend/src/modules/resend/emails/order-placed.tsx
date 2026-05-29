import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components"
import * as React from "react"

type OrderItem = {
  id: string
  title: string
  subtitle?: string
  thumbnail?: string
  quantity: number
  unit_price: number
  total: number
}

type OrderPlacedEmailProps = {
  order: {
    id: string
    display_id: number
    email: string
    currency_code: string
    item_total: number
    shipping_total: number
    tax_total: number
    total: number
    items: OrderItem[]
    shipping_address?: {
      first_name?: string
      last_name?: string
      address_1?: string
      city?: string
      postal_code?: string
      country_code?: string
    }
    shipping_methods?: { name: string; total: number }[]
  }
}

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat([], {
    style: "currency",
    currency: currency.toUpperCase(),
    currencyDisplay: "narrowSymbol",
  }).format(amount)
}

function OrderPlacedEmailComponent({ order }: OrderPlacedEmailProps) {
  const currency = order.currency_code || "gbp"
  const firstName = order.shipping_address?.first_name || ""

  return (
    <Html>
      <Head />
      <Preview>Order #{order.display_id} confirmed — thank you!</Preview>
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f4f4f5", margin: 0 }}>
        <Container style={{ maxWidth: "600px", margin: "40px auto", backgroundColor: "#fff", borderRadius: "8px", overflow: "hidden" }}>
          {/* Header */}
          <Section style={{ backgroundColor: "#18181b", padding: "20px 24px" }}>
            <Text style={{ color: "#fff", margin: 0, fontWeight: "bold", fontSize: "16px" }}>
              Aldevon Store
            </Text>
          </Section>

          {/* Title */}
          <Section style={{ padding: "32px 24px 0" }}>
            <Heading style={{ fontSize: "22px", fontWeight: "bold", color: "#18181b", margin: "0 0 8px" }}>
              {firstName ? `Thank you, ${firstName}!` : "Thank you for your order!"}
            </Heading>
            <Text style={{ color: "#71717a", fontSize: "14px", margin: 0 }}>
              Order #{order.display_id} · We&apos;re processing your order and will notify you when it ships.
            </Text>
          </Section>

          {/* Items */}
          <Section style={{ padding: "24px" }}>
            <Text style={{ fontWeight: "600", fontSize: "14px", color: "#18181b", marginBottom: "12px" }}>
              Your items
            </Text>
            {order.items.map((item) => (
              <Row key={item.id} style={{ marginBottom: "12px" }}>
                <Column style={{ width: "60px" }}>
                  {item.thumbnail && (
                    <Img
                      src={item.thumbnail}
                      width="56"
                      height="56"
                      alt={item.title}
                      style={{ borderRadius: "4px", objectFit: "cover" }}
                    />
                  )}
                </Column>
                <Column style={{ paddingLeft: "12px" }}>
                  <Text style={{ margin: "0 0 2px", fontSize: "14px", fontWeight: "500", color: "#18181b" }}>
                    {item.title}
                  </Text>
                  {item.subtitle && (
                    <Text style={{ margin: "0 0 2px", fontSize: "12px", color: "#71717a" }}>
                      {item.subtitle}
                    </Text>
                  )}
                  <Text style={{ margin: 0, fontSize: "12px", color: "#71717a" }}>
                    Qty: {item.quantity}
                  </Text>
                </Column>
                <Column style={{ textAlign: "right", verticalAlign: "top" }}>
                  <Text style={{ margin: 0, fontSize: "14px", fontWeight: "500", color: "#18181b" }}>
                    {formatPrice(item.total, currency)}
                  </Text>
                </Column>
              </Row>
            ))}
          </Section>

          {/* Summary */}
          <Section style={{ padding: "0 24px 24px", borderTop: "1px solid #f4f4f5" }}>
            <Row style={{ marginTop: "16px" }}>
              <Column><Text style={{ margin: "4px 0", fontSize: "13px", color: "#71717a" }}>Subtotal</Text></Column>
              <Column style={{ textAlign: "right" }}><Text style={{ margin: "4px 0", fontSize: "13px", color: "#71717a" }}>{formatPrice(order.item_total, currency)}</Text></Column>
            </Row>
            {(order.shipping_methods || []).map((method, i) => (
              <Row key={i}>
                <Column><Text style={{ margin: "4px 0", fontSize: "13px", color: "#71717a" }}>{method.name}</Text></Column>
                <Column style={{ textAlign: "right" }}><Text style={{ margin: "4px 0", fontSize: "13px", color: "#71717a" }}>{formatPrice(method.total, currency)}</Text></Column>
              </Row>
            ))}
            {(order.tax_total || 0) > 0 && (
              <Row>
                <Column><Text style={{ margin: "4px 0", fontSize: "13px", color: "#71717a" }}>Tax</Text></Column>
                <Column style={{ textAlign: "right" }}><Text style={{ margin: "4px 0", fontSize: "13px", color: "#71717a" }}>{formatPrice(order.tax_total, currency)}</Text></Column>
              </Row>
            )}
            <Row style={{ borderTop: "1px solid #e4e4e7", marginTop: "8px" }}>
              <Column><Text style={{ margin: "12px 0 0", fontSize: "15px", fontWeight: "bold", color: "#18181b" }}>Total</Text></Column>
              <Column style={{ textAlign: "right" }}><Text style={{ margin: "12px 0 0", fontSize: "15px", fontWeight: "bold", color: "#18181b" }}>{formatPrice(order.total, currency)}</Text></Column>
            </Row>
          </Section>

          {/* Shipping address */}
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

          {/* Footer */}
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

export const orderPlacedEmail = (props: OrderPlacedEmailProps) => (
  <OrderPlacedEmailComponent {...props} />
)
