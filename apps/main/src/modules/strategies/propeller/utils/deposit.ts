import {
  encodeFunctionData,
  erc20Abi,
  type Hex,
  type PublicClient,
  zeroAddress,
} from "viem"

import { VAULT_ABI } from "@/modules/strategies/propeller/config/abi"

const MAX_NATIVE_TX_GAS = 1n << 24n
type DepositInput = { vault: Hex; asset: Hex; owner: Hex; amount: bigint }

/** Deposits are collateral-only; keeper trade budgets do not gate admission. */
export const readDepositCapacity = async (
  client: PublicClient,
  vault: Hex,
  asset: Hex,
) => {
  const at = { blockNumber: await client.getBlockNumber() }
  const supported = await client.readContract({
    address: vault,
    abi: VAULT_ABI,
    functionName: "deferredDeployment",
    ...at,
  })
  // The deposit selector existed on older, synchronously trading vaults. Never infer
  // the new behavior from a successful deposit simulation or reinvestAssets.
  if (supported !== true)
    throw new Error("This vault does not support deferred deployment")
  const contract = { address: vault, abi: VAULT_ABI, ...at }
  const [
    collateral,
    cap,
    total,
    supply,
    paused,
    depositsPaused,
    deficitStop,
    deleverTarget,
    mainDebt,
  ] = await Promise.all([
    client.readContract({ ...contract, functionName: "asset" }),
    client.readContract({ ...contract, functionName: "tvlCap" }),
    client.readContract({ ...contract, functionName: "totalAssets" }),
    client.readContract({ ...contract, functionName: "totalSupply" }),
    client.readContract({ ...contract, functionName: "paused" }),
    client.readContract({ ...contract, functionName: "depositsPaused" }),
    client.readContract({ ...contract, functionName: "deficitStop" }),
    client.readContract({ ...contract, functionName: "deleverTarget" }),
    client.readContract({ ...contract, functionName: "mainDebt" }),
  ])
  if (collateral.toLowerCase() !== asset.toLowerCase())
    throw new Error("The configured collateral does not match this vault")
  return {
    blockNumber: at.blockNumber,
    maximum: cap > total ? cap - total : 0n,
    // Governance must bootstrap a fresh vault before opening public deposits.
    ready: supply > 0n && mainDebt !== zeroAddress,
    // deposits revert on either pause flag and while a de-lever is due
    paused: paused || depositsPaused || deficitStop || deleverTarget > 0n,
  }
}

export const assertDepositCapacity = (
  capacity: Awaited<ReturnType<typeof readDepositCapacity>>,
  amount: bigint,
) => {
  if (
    !capacity.ready ||
    capacity.paused ||
    amount <= 0n ||
    amount > capacity.maximum
  )
    throw new Error(
      "Deposit availability changed. Check the vault status and amount, then retry.",
    )
}

/** Simulate the direct collateral-only deposit after approval has completed. */
export const prepareFundedDeposit = async (
  client: PublicClient,
  { vault, asset, owner, amount }: DepositInput,
) => {
  if (owner === zeroAddress)
    throw new Error("Connect an account before depositing")
  assertDepositCapacity(await readDepositCapacity(client, vault, asset), amount)
  const request = {
    account: owner,
    address: vault,
    abi: VAULT_ABI,
    functionName: "deposit",
    args: [amount, owner],
  } as const
  const { result: shares } = await client.simulateContract(request)
  if (shares <= 0n)
    throw new Error("The deposit would receive no funded shares")
  const [estimate, block] = await Promise.all([
    client.estimateContractGas(request),
    client.getBlock({ blockTag: "latest" }),
  ])
  const gas = (estimate * 120n + 99n) / 100n
  if (gas > MAX_NATIVE_TX_GAS || gas > block.gasLimit)
    throw new Error("This deposit exceeds the transaction gas limit")
  return {
    to: vault,
    data: encodeFunctionData(request),
    abi: VAULT_ABI,
    gas,
    shares,
  }
}

/**
 * Approval is the only preparatory wallet transaction; keepers deploy later.
 * Returns the approve call, or null when the allowance already covers the amount.
 */
export const prepareApproval = async (
  client: PublicClient,
  { vault, asset, owner, amount }: DepositInput,
) => {
  if (owner === zeroAddress)
    throw new Error("Connect an account before depositing")
  assertDepositCapacity(await readDepositCapacity(client, vault, asset), amount)
  const allowance = await client.readContract({
    address: asset,
    abi: erc20Abi,
    functionName: "allowance",
    args: [owner, vault],
  })
  if (allowance >= amount) return null
  return {
    to: asset,
    abi: erc20Abi,
    data: encodeFunctionData({
      abi: erc20Abi,
      functionName: "approve",
      args: [vault, amount],
    }),
  }
}
