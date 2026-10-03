import {
  getFunctionSelector,
  type Hex,
  type PublicClient,
  zeroAddress,
} from "viem"

import {
  EXECUTION_ABI,
  POOL_ABI,
  PRICE_ORACLE_ABI,
  PRICE_PROVIDER_ABI,
  SUBLOOP_ABI,
  VAULT_ABI,
} from "@/modules/strategies/propeller/config/abi"

const ceilDiv = (a: bigint, b: bigint) => (a + b - 1n) / b
const HOLLAR_PER_USD8 = 10_000_000_000n

/** Collateral-native bounds for the USD8 -> LTV -> HOLLAR18 borrow calculation.
 * The maximum reserves one USD8 rounding unit for the existing Aave balance.
 * The real deposit preview remains authoritative for interest and route changes.
 */
export const depositBounds = ({
  minimumHollar,
  availableHollar,
  price,
  ltvBps,
  decimals,
  remainingAssets,
}: {
  minimumHollar: bigint
  availableHollar: bigint
  price: bigint
  ltvBps: bigint
  decimals: number
  remainingAssets: bigint
}) => {
  if (price <= 0n || ltvBps <= 0n || ltvBps > 10_000n || minimumHollar <= 0n)
    throw new Error("Deposit sizing parameters are unavailable")
  const unit = 10n ** BigInt(decimals)
  const minimumBase = ceilDiv(
    ceilDiv(minimumHollar, HOLLAR_PER_USD8) * 10_000n,
    ltvBps,
  )
  const minimum = ceilDiv(minimumBase * unit, price)
  const maxBaseExclusive = ceilDiv(
    (availableHollar / HOLLAR_PER_USD8 + 1n) * 10_000n,
    ltvBps,
  )
  const tradeMaximum =
    availableHollar < minimumHollar
      ? 0n
      : ((maxBaseExclusive - 1n) * unit) / price
  const capacity = remainingAssets > 0n ? remainingAssets : 0n
  const maximum = capacity < tradeMaximum ? capacity : tradeMaximum
  return { minimum, maximum: maximum < minimum ? 0n : maximum }
}

export const readDepositAdmission = async (
  client: PublicClient,
  vault: Hex,
  asset: Hex,
  decimals: number,
) => {
  const block = await client.getBlock({ blockTag: "latest" })
  const at = { blockNumber: block.number }
  const [controller, source, pool, collateral, cap, total] = await Promise.all([
    client.readContract({
      address: vault,
      abi: VAULT_ABI,
      functionName: "executionController",
      ...at,
    }),
    client.readContract({
      address: vault,
      abi: VAULT_ABI,
      functionName: "yieldSource",
      ...at,
    }),
    client.readContract({
      address: vault,
      abi: VAULT_ABI,
      functionName: "pool",
      ...at,
    }),
    client.readContract({
      address: vault,
      abi: VAULT_ABI,
      functionName: "asset",
      ...at,
    }),
    client.readContract({
      address: vault,
      abi: VAULT_ABI,
      functionName: "tvlCap",
      ...at,
    }),
    client.readContract({
      address: vault,
      abi: VAULT_ABI,
      functionName: "totalAssets",
      ...at,
    }),
  ])
  if (
    controller === zeroAddress ||
    collateral.toLowerCase() !== asset.toLowerCase()
  )
    throw new Error("Controlled deposits are not configured for this vault")
  const [sourceController, hollar, aPrime, config, provider, enabled] =
    await Promise.all([
      client.readContract({
        address: source,
        abi: SUBLOOP_ABI,
        functionName: "executionController",
        ...at,
      }),
      client.readContract({
        address: source,
        abi: SUBLOOP_ABI,
        functionName: "hollar",
        ...at,
      }),
      client.readContract({
        address: source,
        abi: SUBLOOP_ABI,
        functionName: "primeAToken",
        ...at,
      }),
      client.readContract({
        address: pool,
        abi: POOL_ABI,
        functionName: "getConfiguration",
        args: [asset],
        ...at,
      }),
      client.readContract({
        address: pool,
        abi: POOL_ABI,
        functionName: "ADDRESSES_PROVIDER",
        ...at,
      }),
      client.readContract({
        address: controller,
        abi: EXECUTION_ABI,
        functionName: "actions",
        args: [vault, getFunctionSelector("deposit(uint256,address)")],
        ...at,
      }),
    ])
  if (sourceController.toLowerCase() !== controller.toLowerCase() || !enabled)
    throw new Error("Controlled deposits are not enabled for this vault")
  const [lane, availableHollar, oracle] = await Promise.all([
    client.readContract({
      address: controller,
      abi: EXECUTION_ABI,
      functionName: "lane",
      args: [source, hollar, aPrime],
      ...at,
    }),
    client.readContract({
      address: controller,
      abi: EXECUTION_ABI,
      functionName: "available",
      args: [source, hollar, aPrime],
      ...at,
    }),
    client.readContract({
      address: provider,
      abi: PRICE_PROVIDER_ABI,
      functionName: "getPriceOracle",
      ...at,
    }),
  ])
  const [[group, minimumHollar], price] = await Promise.all([
    client.readContract({
      address: controller,
      abi: EXECUTION_ABI,
      functionName: "limits",
      args: [lane],
      ...at,
    }),
    client.readContract({
      address: oracle,
      abi: PRICE_ORACLE_ABI,
      functionName: "getAssetPrice",
      args: [asset],
      ...at,
    }),
  ])
  const budget = await client.readContract({
    address: controller,
    abi: EXECUTION_ABI,
    functionName: "budgets",
    args: [group],
    ...at,
  })
  return {
    controller,
    blockNumber: block.number,
    expired: budget[5] <= block.timestamp,
    ...depositBounds({
      minimumHollar,
      availableHollar,
      price,
      ltvBps: config & 0xffffn,
      decimals,
      remainingAssets: cap - total,
    }),
  }
}
