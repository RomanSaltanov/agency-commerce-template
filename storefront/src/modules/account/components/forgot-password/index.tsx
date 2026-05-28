"use client"

import { useActionState } from "react"
import { requestPasswordReset } from "@lib/data/customer"
import Input from "@modules/common/components/input"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const ForgotPassword = () => {
  const [state, formAction] = useActionState(requestPasswordReset, null)

  if (state?.success) {
    return (
      <div className="max-w-sm w-full flex flex-col items-center">
        <h1 className="text-large-semi uppercase mb-6">Check your email</h1>
        <p className="text-center text-base-regular text-ui-fg-base mb-8">
          If an account exists for that email address, we&apos;ve sent a
          password reset link.
        </p>
        <LocalizedClientLink href="/account" className="underline text-small-regular">
          Back to sign in
        </LocalizedClientLink>
      </div>
    )
  }

  return (
    <div className="max-w-sm w-full flex flex-col items-center">
      <h1 className="text-large-semi uppercase mb-6">Forgot password</h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-8">
        Enter your email address and we&apos;ll send you a link to reset your
        password.
      </p>
      <form className="w-full" action={formAction}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </div>
        <ErrorMessage error={state?.error ?? null} />
        <SubmitButton className="w-full mt-6">Send reset link</SubmitButton>
      </form>
      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        Remember your password?{" "}
        <LocalizedClientLink href="/account" className="underline">
          Sign in
        </LocalizedClientLink>
      </span>
    </div>
  )
}

export default ForgotPassword
