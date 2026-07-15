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

type InviteUserEmailProps = {
  inviteLink: string
}

function InviteUserEmailComponent({ inviteLink }: InviteUserEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>You've been invited to join Aldevon Admin</Preview>
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
              You've been invited
            </Heading>
            <Text style={{ color: "#71717a", fontSize: "16px" }}>
              You have been invited to join the Aldevon Admin dashboard. Click
              the button below to create your account.
            </Text>
            <Button
              href={inviteLink}
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
              Accept Invite
            </Button>
            <Text style={{ color: "#a1a1aa", fontSize: "14px", marginTop: "24px" }}>
              If you did not expect this invitation, you can safely ignore this
              email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export const inviteUserEmail = (props: InviteUserEmailProps) => (
  <InviteUserEmailComponent {...props} />
)
