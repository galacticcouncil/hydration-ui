import { builders, chainsMap } from "@galacticcouncil/xc-cfg"
import { AssetRoute, EvmParachain } from "@galacticcouncil/xc-core"

const { ContractBuilder, BalanceBuilder } = builders

/**
 * Supplemental bridge routes for asset pairs where the configService only stores
 * one route due to ChainRoutes Map deduplication (keyed by srcAsset-destChain-destAsset).
 *
 * These are the "lost" routes that are defined in xc-cfg source but overwritten
 * at runtime. We reconstruct them using the public contract/balance builders.
 *
 * Key format: `${srcChainKey}-${destChainKey}-${srcAssetKey}`
 */
const buildSupplementalRoutes = (): Map<string, AssetRoute[]> => {
  const base = chainsMap.get("base")
  const hydration = chainsMap.get("hydration")
  const moonbeam = chainsMap.get("moonbeam")

  if (!base || !hydration || !moonbeam) return new Map()

  const eurc = base.assetsData.get("eurc")?.asset
  const eurcMwh = hydration.assetsData.get("eurc_mwh")?.asset
  const eth = base.assetsData.get("eth")?.asset

  if (!eurc || !eurcMwh || !eth) return new Map()

  // Base → Hydration EURC via Wormhole+MRL
  // This route is overwritten in ChainRoutes by the Basejump route (same map key)
  const wormholeRoute = new AssetRoute({
    source: {
      asset: eurc,
      balance: BalanceBuilder().evm().erc20(),
      fee: { asset: eth, balance: BalanceBuilder().evm().native() },
      destinationFee: { asset: eurc, balance: BalanceBuilder().evm().erc20() },
    },
    destination: {
      chain: hydration,
      asset: eurcMwh,
      fee: { amount: 0, asset: eurcMwh },
    },
    contract: ContractBuilder()
      .Wormhole()
      .TokenBridge()
      .transferTokensWithPayload()
      .viaMrl({ moonchain: moonbeam as EvmParachain }),
    tags: ["Mrl", "Wormhole"],
  })

  return new Map([["base-hydration-eurc", [wormholeRoute]]])
}

const SUPPLEMENTAL_ROUTES = buildSupplementalRoutes()

/**
 * Returns bridge routes for a given asset pair that are NOT present in the
 * configService (because ChainRoutes overwrites them with a later duplicate key).
 */
export const getSupplementalBridgeRoutes = (
  srcChainKey: string,
  destChainKey: string,
  srcAssetKey: string,
): AssetRoute[] => {
  return SUPPLEMENTAL_ROUTES.get(`${srcChainKey}-${destChainKey}-${srcAssetKey}`) ?? []
}
