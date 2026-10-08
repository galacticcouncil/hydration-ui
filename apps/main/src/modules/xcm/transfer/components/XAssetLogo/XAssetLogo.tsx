import { AssetLogo as AssetLogoPrimitive } from "@galacticcouncil/ui/components"
import {
  getChainAssetId,
  getChainId,
  HYDRATION_PARACHAIN_ID,
} from "@galacticcouncil/utils"
import { AnyChain, Asset, ChainEcosystem } from "@galacticcouncil/xc-core"

import { useAssetMetadata } from "@/api/metadata"
import { useHydrationDisplayAssetId } from "@/api/xcm"
import { AssetLogo } from "@/components/AssetLogo"
import { ExternalAssetLogo } from "@/components/ExternalAssetLogo"

export type XAssetLogoProps = {
  asset: Asset
  chain: AnyChain
  className?: string
}

/**
 * True when more than one asset on the chain answers to this on-chain id.
 * Robinhood's native ETH and its WETH ERC-20 share a contract.
 */
const isChainAssetIdAmbiguous = (chain: AnyChain, chainAssetId: string) =>
  chain
    .getAssets()
    .filter((a) => getChainAssetId(chain, a).toString() === chainAssetId)
    .length > 1

export const XAssetLogo: React.FC<XAssetLogoProps> = ({
  asset,
  chain,
  className,
}) => {
  const metadata = useAssetMetadata()
  const getDisplayAssetId = useHydrationDisplayAssetId()

  const registryId = getDisplayAssetId(asset)

  const isExternalEcosystem =
    chain.isEvmChain() || chain.isSolana() || chain.isSui()

  if (isExternalEcosystem) {
    const ecosystem = chain.ecosystem || ChainEcosystem.Polkadot
    const chainId = getChainId(chain) ?? ""
    const chainAssetId = getChainAssetId(chain, asset).toString()

    // The CDN keys icons by on-chain id, so assets sharing one would render
    // identically. The Hydration registry has an icon per asset, so take the
    // icon from there and keep the source chain's badge.
    if (registryId && isChainAssetIdAmbiguous(chain, chainAssetId)) {
      return (
        <AssetLogoPrimitive
          src={metadata.getAssetLogoSrc(HYDRATION_PARACHAIN_ID, registryId)}
          chainSrc={metadata.getChainLogoSrc(chainId, ecosystem)}
          className={className}
        />
      )
    }

    return (
      <ExternalAssetLogo
        id={chainAssetId}
        ecosystem={ecosystem}
        chainId={chainId}
        className={className}
      />
    )
  }

  return <AssetLogo id={registryId ?? ""} className={className} />
}
