import { SdkCtx } from "@galacticcouncil/sdk-next"
import { ChainEcosystem } from "@galacticcouncil/xc-core"
import { parseAbi, PublicClient, zeroAddress } from "viem"

import { AssetType, TAssetData, TToken } from "@/api/assets"
import { PoolToken, PoolType, V3PoolBase } from "@/api/pools"
import { useAssetRegistryStore } from "@/states/assetRegistry"

import { BOOTSTRAP_V3_POOLS, GAMMA_CONTRACTS } from "./config"

const HYPERVISOR_ABI = parseAbi(["function pool() view returns (address)"])

const POOL_ABI = parseAbi([
  "function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
  "function liquidity() view returns (uint128)",
  "function fee() view returns (uint24)",
  "function tickSpacing() view returns (int24)",
  "function token0() view returns (address)",
  "function token1() view returns (address)",
])

const toPoolToken = (asset: TAssetData, balance: bigint): PoolToken => ({
  id: Number(asset.id),
  decimals: asset.decimals,
  existentialDeposit: BigInt(asset.existentialDeposit),
  balance,
  type: asset.type as PoolToken["type"],
})

const resolveAsset = async (
  id: number,
  sdk: SdkCtx,
): Promise<TAssetData | null> => {
  const stored = useAssetRegistryStore
    .getState()
    .assets.find((asset) => asset.id === id.toString())

  if (stored) return stored

  const assets = await sdk.client.asset.getSupported(true)
  const asset = assets.find((entry) => entry.id === id)
  if (!asset) return null

  const fallback: TToken = {
    id: id.toString(),
    existentialDeposit: asset.existentialDeposit.toString(),
    symbol: asset.symbol ?? "",
    decimals: asset.decimals ?? 0,
    name: asset.name ?? "",
    isTradable: false,
    isSufficient: asset.isSufficient,
    type: AssetType.TOKEN,
    ecosystem: ChainEcosystem.Polkadot,
  }

  return fallback
}

/**
 * Loads curated v3 pools over EVM when the SDK venue is off (factory parameter
 * unset). The bootstrap hypervisor names the canonical pool address.
 */
export const loadBootstrapV3Pools = async (
  evm: PublicClient,
  sdk: SdkCtx,
): Promise<V3PoolBase[]> => {
  const poolAddress = await evm.readContract({
    abi: HYPERVISOR_ABI,
    address: GAMMA_CONTRACTS.hypervisor,
    functionName: "pool",
  })

  if (poolAddress.toLowerCase() === zeroAddress) return []

  const [slot0, liquidity, fee, tickSpacing, addr0, addr1] = await Promise.all([
    evm.readContract({
      abi: POOL_ABI,
      address: poolAddress,
      functionName: "slot0",
    }),
    evm.readContract({
      abi: POOL_ABI,
      address: poolAddress,
      functionName: "liquidity",
    }),
    evm.readContract({
      abi: POOL_ABI,
      address: poolAddress,
      functionName: "fee",
    }),
    evm.readContract({
      abi: POOL_ABI,
      address: poolAddress,
      functionName: "tickSpacing",
    }),
    evm.readContract({
      abi: POOL_ABI,
      address: poolAddress,
      functionName: "token0",
    }),
    evm.readContract({
      abi: POOL_ABI,
      address: poolAddress,
      functionName: "token1",
    }),
  ])

  const cfg = BOOTSTRAP_V3_POOLS.find((entry) => entry.fee === Number(fee))
  if (!cfg) return []

  const [meta0, meta1] = await Promise.all([
    resolveAsset(cfg.token0, sdk),
    resolveAsset(cfg.token1, sdk),
  ])
  if (!meta0 || !meta1) return []

  const token0 = toPoolToken(meta0, 0n)
  const token1 = toPoolToken(meta1, 0n)

  return [
    {
      address: poolAddress,
      type: PoolType.V3 as V3PoolBase["type"],
      token0: cfg.token0,
      token1: cfg.token1,
      addr0,
      addr1,
      fee: Number(fee),
      sqrtPriceX96: slot0[0],
      tick: Number(slot0[1]),
      liquidity,
      tickSpacing: Number(tickSpacing),
      tokens: [token0, token1],
      maxInRatio: 0n,
      maxOutRatio: 0n,
      minTradingLimit: 0n,
    },
  ]
}
