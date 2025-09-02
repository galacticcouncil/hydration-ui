import { Logo, LogoProps } from "@galacticcouncil/ui/components"
import { getChainId } from "@galacticcouncil/utils"
import { AnyChain, ChainEcosystem } from "@galacticcouncil/xcm-core"

import { useRpcProvider } from "@/providers/rpcProvider"

type ChainLogoProps = LogoProps & {
  chain: AnyChain
}

export const ChainLogo: React.FC<ChainLogoProps> = ({ chain, ...props }) => {
  const { metadata } = useRpcProvider()

  const ecosystem = chain?.ecosystem || ChainEcosystem.Polkadot
  const chainId = getChainId(chain)
  const src = metadata.getChainLogoSrc(chainId, ecosystem)

  return <Logo src={src} alt={chain.name} {...props} />
}
