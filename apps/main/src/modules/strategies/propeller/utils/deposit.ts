import { isBigInt, isNumber, isPlainObject, isString } from "remeda"
import {
  encodeFunctionData,
  erc20Abi,
  type Hex,
  maxUint128,
  type PublicClient,
  zeroAddress,
} from "viem"

import { VAULT_ABI } from "@/modules/strategies/propeller/config/abi"
import {
  DEPOSIT_MIN_GAS,
  EVM_CALL_GAS,
} from "@/modules/strategies/propeller/constants"

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

const depositRequest = ({ vault, owner, amount }: DepositInput) =>
  ({
    account: owner,
    address: vault,
    abi: VAULT_ABI,
    functionName: "deposit",
    args: [amount, owner],
  }) as const

/** Simulate the direct collateral-only deposit after approval has completed. */
export const prepareFundedDeposit = async (
  client: PublicClient,
  input: DepositInput,
) => {
  const { vault, asset, owner, amount } = input
  if (owner === zeroAddress)
    throw new Error("Connect an account before depositing")
  assertDepositCapacity(await readDepositCapacity(client, vault, asset), amount)
  const request = depositRequest(input)
  const { result: shares } = await client.simulateContract(request)
  if (shares <= 0n)
    throw new Error("The deposit would receive no funded shares")
  const [estimate, block] = await Promise.all([
    client.estimateContractGas(request),
    client.getBlock({ blockTag: "latest" }),
  ])
  const estimated = (estimate * 120n + 99n) / 100n
  const gas = estimated > DEPOSIT_MIN_GAS ? estimated : DEPOSIT_MIN_GAS
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

/** unsimulated: earlier calls in the same batch fund it */
export const encodeDeposit = (input: DepositInput) => ({
  to: input.vault,
  data: encodeFunctionData(depositRequest(input)),
  abi: VAULT_ABI,
  gas: EVM_CALL_GAS,
})

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
  // asset precompiles revert on allowances above u128
  if (amount > maxUint128)
    throw new Error("The approval exceeds the asset's allowance limit")
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

const isCallNode = (
  value: unknown,
): value is { type: string; value: unknown } =>
  isPlainObject(value) && isString(value.type) && "value" in value

export const readSellLimit = (
  call: unknown,
): { assetIn: number; assetOut: number; minAmountOut: bigint } | null => {
  if (!isCallNode(call) || !isCallNode(call.value)) return null
  const { type: method, value: args } = call.value
  if (!isPlainObject(args)) return null

  if (call.type === "Dispatcher" && method === "dispatch_with_extra_gas")
    return readSellLimit(args.call)

  const minAmountOut =
    call.type === "Router" && (method === "sell" || method === "sell_all")
      ? args.min_amount_out
      : call.type === "Omnipool" && method === "sell"
        ? args.min_buy_amount
        : undefined
  const { asset_in: assetIn, asset_out: assetOut } = args
  if (!isBigInt(minAmountOut) || !isNumber(assetIn) || !isNumber(assetOut))
    return null

  return { assetIn, assetOut, minAmountOut }
}

/** deposits the sell's guaranteed minimum, never more than the trade delivers */
export const prepareSwapDeposit = async (
  client: PublicClient,
  {
    collateralId,
    assetIn,
    tradeCall,
    ...input
  }: Omit<DepositInput, "amount"> & {
    collateralId: string
    assetIn: string
    tradeCall: unknown
  },
) => {
  const sell = readSellLimit(tradeCall)
  if (
    !sell ||
    String(sell.assetIn) !== assetIn ||
    String(sell.assetOut) !== collateralId
  )
    throw new Error("The swap does not buy this vault's collateral")
  const amount = sell.minAmountOut
  return {
    amount,
    approval: await prepareApproval(client, { ...input, amount }),
  }
}
