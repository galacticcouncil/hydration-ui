import { AssetLogo } from "@galacticcouncil/ui/components"
import { LogoProps } from "@galacticcouncil/ui/components/Logo"
import { ChainAssetId, ChainEcosystem } from "@galacticcouncil/xc-core"

import { useAssetMetadata } from "@/api/metadata"

export type ExternalAssetLogoProps = LogoProps & {
  id: ChainAssetId
  ecosystem: ChainEcosystem
  chainId: string | number
  showChainLogo?: boolean
}

export const ExternalAssetLogo: React.FC<ExternalAssetLogoProps> = ({
  chainId,
  id,
  ecosystem,
  showChainLogo = true,
  ...props
}) => {
  const metadata = useAssetMetadata()

  const src = metadata.getAssetLogoSrc(chainId, id.toString(), ecosystem)
  const chainSrc = showChainLogo
    ? metadata.getChainLogoSrc(chainId, ecosystem)
    : undefined

  return <AssetLogo src={src} chainSrc={chainSrc} {...props} />
}
