import { Logo, LogoProps } from "@galacticcouncil/ui/components"
import { ChainEcosystem } from "@galacticcouncil/xc-core"

import { useRpcProvider } from "@/providers/rpcProvider"

type ChainLogoProps = LogoProps & {
  ecosystem?: ChainEcosystem
  chainId: string | number
}

export const ChainLogo: React.FC<ChainLogoProps> = ({
  ecosystem = ChainEcosystem.Polkadot,
  chainId,
  ...props
}) => {
  const { metadata } = useRpcProvider()

  return (
    <Logo
      src={metadata.getChainLogoSrc(chainId, ecosystem)}
      alt={`${ecosystem} ${chainId}`}
      {...props}
    />
  )
}
