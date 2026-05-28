import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components"
import * as React from "react"

type PasswordResetEmailProps = {
  resetLink: string
  firstName?: string
}

function PasswordResetEmailComponent({
  resetLink,
  firstName,
}: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your password</Preview>
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f4f4f5" }}>
        <Container
          style={{
            maxWidth: "600px",
            margin: "40px auto",
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <Section style={{ backgroundColor: "#18181b", padding: "24px" }}>
            <Text style={{ color: "#ffffff", margin: 0, fontWeight: "bold" }}>
              Aldevon Store
            </Text>
          </Section>
          <Section style={{ padding: "32px 24px" }}>
            <Heading
              style={{ fontSize: "24px", fontWeight: "bold", color: "#18181b" }}
            >
              Reset your password
            </Heading>
            <Text style={{ color: "#71717a", fontSize: "16px" }}>
              {firstName ? `Hi ${firstName}, ` : ""}We received a request to
              reset your password. Click the button below to choose a new one.
            </Text>
            <Button
              href={resetLink}
              style={{
                backgroundColor: "#18181b",
                color: "#ffffff",
                padding: "12px 24px",
                borderRadius: "6px",
                fontWeight: "bold",
                fontSize: "14px",
                display: "inline-block",
                marginTop: "16px",
                textDecoration: "none",
              }}
            >
              Reset Password
            </Button>
            <Text style={{ color: "#a1a1aa", fontSize: "14px", marginTop: "24px" }}>
              This link expires in 15 minutes. If you didn&apos;t request a
              password reset, you can safely ignore this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export const passwordResetEmail = (props: PasswordResetEmailProps) => (
  <PasswordResetEmailComponent {...props} />
)
