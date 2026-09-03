import { Logo, LogoProps } from "@galacticcouncil/ui/components"
import { ChainEcosystem } from "@galacticcouncil/xc-core"

import { useAssetMetadata } from "@/api/metadata"

type ChainLogoProps = LogoProps & {
  ecosystem?: ChainEcosystem
  chainId: string | number
}

export const ChainLogo: React.FC<ChainLogoProps> = ({
  ecosystem = ChainEcosystem.Polkadot,
  chainId,
  ...props
}) => {
  const metadata = useAssetMetadata()

  const src = metadata.getChainLogoSrc(chainId, ecosystem)

  return <Logo src={src} alt={`${ecosystem} ${chainId}`} {...props} />
}
