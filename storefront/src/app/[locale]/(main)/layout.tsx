import { Metadata } from "next"
import { Suspense } from "react"

import { getBaseURL } from "@lib/util/env"
import CartExtras from "@modules/layout/components/cart-extras"
import Footer from "@modules/layout/templates/footer"
import Nav from "@modules/layout/templates/nav"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function PageLayout(props: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <Suspense fallback={null}>
        <CartExtras />
      </Suspense>
      {props.children}
      <Footer />
    </>
  )
}
