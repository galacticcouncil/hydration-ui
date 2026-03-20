import { createFileRoute, Navigate, useParams } from "@tanstack/react-router"

function ReferralEntryPoint() {
  useParams({ from: "/$referralCode/" })

  return <Navigate to="/" />
}

export const Route = createFileRoute("/$referralCode/")({
  component: ReferralEntryPoint,
})
