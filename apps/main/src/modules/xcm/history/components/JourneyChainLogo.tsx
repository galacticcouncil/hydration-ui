import { ChainLogo } from "@/components/ChainLogo"
import { resolveNetwork } from "@/modules/xcm/history/utils/assets"

type JourneyChainLogoProps = {
  networkUrn: string
}

export function JourneyChainLogo({ networkUrn }: JourneyChainLogoProps) {
  const network = resolveNetwork(networkUrn)
  if (!network) return null
  return <ChainLogo ecosystem={network.ecosystem} chainId={network.chainId} />
}
