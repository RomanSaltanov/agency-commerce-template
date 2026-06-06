import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { Inter } from "next/font/google"
import { SpeedInsights } from "@vercel/speed-insights/next"
import "styles/globals.css"

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light" className={inter.variable}>
      <body className={inter.className}>
        <main className="relative">{props.children}</main>
        <SpeedInsights />
      </body>
    </html>
  )
}
