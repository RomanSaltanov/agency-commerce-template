"use client"

import { useActionState } from "react"
import { confirmPasswordReset } from "@lib/data/customer"
import Input from "@modules/common/components/input"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type Props = {
  token: string
  email: string
}

const ResetPassword = ({ token, email }: Props) => {
  const resetWithToken = async (state: unknown, formData: FormData) => {
    formData.set("token", token)
    return confirmPasswordReset(state, formData)
  }

  const [state, formAction] = useActionState(resetWithToken, null)

  if (state?.success) {
    return (
      <div className="max-w-sm w-full flex flex-col items-center">
        <h1 className="text-large-semi uppercase mb-6">Password updated</h1>
        <p className="text-center text-base-regular text-ui-fg-base mb-8">
          Your password has been successfully updated.
        </p>
        <LocalizedClientLink
          href="/account"
          className="underline text-small-regular"
        >
          Sign in
        </LocalizedClientLink>
      </div>
    )
  }

  return (
    <div className="max-w-sm w-full flex flex-col items-center">
      <h1 className="text-large-semi uppercase mb-6">Reset password</h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-8">
        Enter a new password for <strong>{email}</strong>.
      </p>
      <form className="w-full" action={formAction}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="New password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
          />
          <Input
            label="Confirm new password"
            name="confirm_password"
            type="password"
            autoComplete="new-password"
            required
          />
        </div>
        <ErrorMessage error={state?.error ?? null} />
        <SubmitButton className="w-full mt-6">Set new password</SubmitButton>
      </form>
    </div>
  )
}

export default ResetPassword
