import { getChainAssetId, getChainId } from "@galacticcouncil/utils"
import { AnyChain, Asset, ChainEcosystem } from "@galacticcouncil/xc-core"

import { AssetLogo } from "@/components/AssetLogo"
import { ExternalAssetLogo } from "@/components/ExternalAssetLogo"
import { useXcmProvider } from "@/modules/xcm/transfer/hooks/useXcmProvider"
import { useAssets } from "@/providers/assetsProvider"

export type XAssetLogoProps = {
  asset: Asset
  chain: AnyChain
  className?: string
}

export const XAssetLogo: React.FC<XAssetLogoProps> = ({
  asset,
  chain,
  className,
}) => {
  const { registryChain } = useXcmProvider()
  const { getAsset } = useAssets()
  const isExternalEcosystem =
    chain.isEvmChain() || chain.isSolana() || chain.isSui()

  if (isExternalEcosystem) {
    return (
      <ExternalAssetLogo
        id={getChainAssetId(chain, asset).toString()}
        ecosystem={chain.ecosystem || ChainEcosystem.Polkadot}
        chainId={getChainId(chain) ?? ""}
        className={className}
      />
    )
  }

  const registryId = registryChain.getBalanceAssetId(asset)
  const registryAsset = getAsset(registryId.toString())

  return (
    <AssetLogo id={registryAsset?.id?.toString() ?? ""} className={className} />
  )
}
