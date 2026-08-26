import { createFileRoute, useParams } from "@tanstack/react-router"

import { VaultDetails } from "@/modules/liquidity/VaultDetails"

const Component = () => {
  const { address } = useParams({ from: "/liquidity/vault/$address" })

  return <VaultDetails address={address} />
}

export const Route = createFileRoute("/liquidity/vault/$address")({
  component: Component,
})
