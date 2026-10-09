import { type Hex, type PublicClient } from "viem"

import {
  VAULT_ABI,
  YIELD_ACCOUNTING_ABI,
} from "@/modules/strategies/propeller/config/abi"

/**
 * yield earned but not harvested yet, in collateral units. earnedAssets also
 * counts funded earnings, which balanceOf already includes
 */
export const readPendingYield = async (
  client: PublicClient,
  vault: Hex,
  owner: Hex,
  blockNumber: bigint,
) => {
  const at = { blockNumber }
  const accounting = await client.readContract({
    address: vault,
    abi: VAULT_ABI,
    functionName: "yieldAccounting",
    ...at,
  })
  const [earned, funded] = await Promise.all([
    client.readContract({
      address: accounting,
      abi: YIELD_ACCOUNTING_ABI,
      functionName: "earnedAssets",
      args: [owner],
      ...at,
    }),
    client.readContract({
      address: accounting,
      abi: YIELD_ACCOUNTING_ABI,
      functionName: "fundedOf",
      args: [owner],
      ...at,
    }),
  ])
  const fundedAssets =
    funded === 0n
      ? 0n
      : await client.readContract({
          address: vault,
          abi: VAULT_ABI,
          functionName: "convertToAssets",
          args: [funded],
          ...at,
        })
  // the two conversions round separately, so funded can exceed earned by a unit
  return earned > fundedAssets ? earned - fundedAssets : 0n
}
