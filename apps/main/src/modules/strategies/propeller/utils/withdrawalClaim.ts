import {
  encodeFunctionData,
  type Hex,
  type PublicClient,
  toFunctionSelector,
  zeroAddress,
} from "viem"

import {
  MAIN_DEBT_ABI,
  VAULT_ABI,
} from "@/modules/strategies/propeller/config/abi"

const ERC1967_IMPLEMENTATION_SLOT =
  "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc"
const EXACT_CLAIM = toFunctionSelector("claim(uint256,address,uint256)").slice(
  2,
)
const exactClaimByVault = new Map<string, Promise<boolean>>()

/**
 * Whether the deployed vault claims an exact amount. The older claim pays
 * everything settled at execution, so a tranche landing between preparing and
 * including a claim reaches the wallet unsold, as the collateral itself.
 */
export const readClaimTakesAmount = (client: PublicClient, vault: Hex) => {
  const key = vault.toLowerCase()
  const cached = exactClaimByVault.get(key)
  if (cached) return cached
  const read = (async () => {
    try {
      const slot = await client.getStorageAt({
        address: vault,
        slot: ERC1967_IMPLEMENTATION_SLOT,
      })
      const implementation =
        slot && BigInt(slot) !== 0n ? (`0x${slot.slice(-40)}` as Hex) : vault
      const code = await client.getCode({ address: implementation })
      return !!code && code.includes(EXACT_CLAIM)
    } catch {
      return false
    }
  })()
  exactClaimByVault.set(key, read)
  return read
}

export const prepareWithdrawalClaim = async (
  client: PublicClient,
  vaultAddress: Hex,
  requestId: number,
  receiver: Hex,
) => {
  // Refresh both payouts at one block; the table may still show an already claimed balance.
  const blockNumber = await client.getBlockNumber()
  const args = [BigInt(requestId)] as const
  const [redemption, mainDebt] = await Promise.all([
    client.readContract({
      address: vaultAddress,
      abi: VAULT_ABI,
      functionName: "redemptions",
      args,
      blockNumber,
    }),
    client.readContract({
      address: vaultAddress,
      abi: VAULT_ABI,
      functionName: "mainDebt",
      blockNumber,
    }),
  ])
  if (redemption[0].toLowerCase() !== receiver.toLowerCase()) {
    throw new Error("Withdrawal does not belong to the connected account")
  }
  const collateral = redemption[8] ? redemption[6] : 0n
  const exact = await readClaimTakesAmount(client, vaultAddress)
  const surplusHollar =
    mainDebt === zeroAddress
      ? 0n
      : await client.readContract({
          address: mainDebt,
          abi: MAIN_DEBT_ABI,
          functionName: "surplusOf",
          args,
          blockNumber,
        })
  const calls = [
    ...(collateral > 0n
      ? [
          {
            to: vaultAddress,
            data: encodeFunctionData({
              abi: VAULT_ABI,
              functionName: "claim",
              // exactly what the batch sells after it; older vaults pay all
              args: exact
                ? [BigInt(requestId), receiver, collateral]
                : [BigInt(requestId), receiver],
            }),
            abi: VAULT_ABI,
          },
        ]
      : []),
    ...(surplusHollar > 0n
      ? [
          {
            to: mainDebt,
            data: encodeFunctionData({
              abi: MAIN_DEBT_ABI,
              functionName: "claimSurplus",
              args,
            }),
            abi: MAIN_DEBT_ABI,
          },
        ]
      : []),
  ]
  // the whole debt slice is repaid: nothing more can settle before inclusion
  const complete = redemption[3] > 0n && redemption[5] >= redemption[3]
  return { calls, collateral, surplusHollar, complete, exact }
}
