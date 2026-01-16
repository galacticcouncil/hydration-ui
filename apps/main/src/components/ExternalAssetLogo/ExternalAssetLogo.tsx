import { AssetLogo } from "@galacticcouncil/ui/components"
import { LogoProps } from "@galacticcouncil/ui/components/Logo"
import { ChainAssetId, ChainEcosystem } from "@galacticcouncil/xc-core"

import { useRpcProvider } from "@/providers/rpcProvider"

export type ExternalAssetLogoProps = LogoProps & {
  id: ChainAssetId
  ecosystem: ChainEcosystem
  chainId: string | number
}

export const ExternalAssetLogo: React.FC<ExternalAssetLogoProps> = ({
  chainId,
  id,
  ecosystem,
  ...props
}) => {
  const { metadata } = useRpcProvider()

  const src = metadata.getAssetLogoSrc(chainId, id.toString(), ecosystem)
  const chainSrc = metadata.getChainLogoSrc(chainId, ecosystem)

  return <AssetLogo src={src} chainSrc={chainSrc} {...props} />
}
