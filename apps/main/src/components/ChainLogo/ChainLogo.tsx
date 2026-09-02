import { Logo, LogoProps } from "@galacticcouncil/ui/components"
import { ChainEcosystem } from "@galacticcouncil/xc-core"

import { getXcSwapChainLogoUrl } from "@/modules/trade/swap/sections/XcSwap/config/meta"
import { useRpcProvider } from "@/providers/rpcProvider"

type ChainLogoProps = LogoProps & {
  ecosystem?: ChainEcosystem
  chainId: string | number
  chainKey?: string
}

export const ChainLogo: React.FC<ChainLogoProps> = ({
  ecosystem = ChainEcosystem.Polkadot,
  chainId,
  chainKey,
  ...props
}) => {
  const { metadata } = useRpcProvider()

  const src =
    metadata.getChainLogoSrc(chainId, ecosystem) ||
    (chainKey ? getXcSwapChainLogoUrl(chainKey) : "")

  return <Logo src={src} alt={`${ecosystem} ${chainId}`} {...props} />
}
