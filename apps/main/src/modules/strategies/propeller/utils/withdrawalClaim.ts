import {
  encodeFunctionData,
  type Hex,
  type PublicClient,
  zeroAddress,
} from "viem"

import {
  MAIN_DEBT_ABI,
  VAULT_ABI,
} from "@/modules/strategies/propeller/config/abi"

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
              args: [BigInt(requestId), receiver],
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
  return { calls, collateral, surplusHollar }
}
