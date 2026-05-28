import { Metadata } from "next"
import { redirect } from "next/navigation"
import ResetPassword from "@modules/account/components/reset-password"

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Set a new password for your Aldevon Store account.",
}

type Props = {
  searchParams: Promise<{ token?: string; email?: string }>
}

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { token, email } = await searchParams

  if (!token || !email) {
    redirect("/account/forgot-password")
  }

  return (
    <div className="w-full flex justify-start px-8 py-8">
      <ResetPassword token={token} email={decodeURIComponent(email)} />
    </div>
  )
}
