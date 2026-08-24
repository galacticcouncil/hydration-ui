import { getChainAssetId, getChainId } from "@galacticcouncil/utils"
import { AnyChain, Asset, ChainEcosystem } from "@galacticcouncil/xc-core"

import { useHydrationAssetId } from "@/api/xcm"
import { AssetLogo } from "@/components/AssetLogo"
import { ExternalAssetLogo } from "@/components/ExternalAssetLogo"
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
  const getHydrationAssetId = useHydrationAssetId()
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

  const registryId = getHydrationAssetId(asset, chain.key)
  const registryAsset = registryId ? getAsset(registryId) : undefined

  return (
    <AssetLogo id={registryAsset?.id?.toString() ?? ""} className={className} />
  )
}
