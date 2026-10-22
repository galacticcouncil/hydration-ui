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

type Hop = { pool: string; assetIn: number; assetOut: number }

const readHop = (hop: unknown): Hop | null =>
  isPlainObject(hop) &&
  isPlainObject(hop.pool) &&
  isString(hop.pool.type) &&
  isNumber(hop.asset_in) &&
  isNumber(hop.asset_out)
    ? { pool: hop.pool.type, assetIn: hop.asset_in, assetOut: hop.asset_out }
    : null

export const readSellLimit = (
  call: unknown,
): {
  assetIn: number
  assetOut: number
  minAmountOut: bigint
  /** absent on sell_all, which sells the whole balance */
  amountIn?: bigint
  /** router sells only */
  route?: Hop[]
} | null => {
  if (!isCallNode(call) || !isCallNode(call.value)) return null
  const { type: method, value: args } = call.value
  if (!isPlainObject(args)) return null

  if (call.type === "Dispatcher" && method === "dispatch_with_extra_gas")
    return readSellLimit(args.call)

  const isRouter =
    call.type === "Router" && (method === "sell" || method === "sell_all")
  const minAmountOut = isRouter
    ? args.min_amount_out
    : call.type === "Omnipool" && method === "sell"
      ? args.min_buy_amount
      : undefined
  const { asset_in: assetIn, asset_out: assetOut } = args
  if (!isBigInt(minAmountOut) || !isNumber(assetIn) || !isNumber(assetOut))
    return null

  const route =
    isRouter && Array.isArray(args.route) ? args.route.map(readHop) : undefined
  return {
    assetIn,
    assetOut,
    minAmountOut,
    ...(isRouter && isBigInt(args.amount_in) && { amountIn: args.amount_in }),
    ...(route?.every((hop) => hop !== null) && { route }),
  }
}

/** the runtime's AAVE_ROUNDING_BUFFER, in wei */
const AAVE_ROUNDING_BUFFER = 2n

const withMinAmountOut = (call: unknown, minAmountOut: bigint): unknown => {
  if (!isCallNode(call) || !isCallNode(call.value)) return call
  const args = call.value.value as Record<string, unknown>
  const next =
    call.type === "Dispatcher"
      ? { ...args, call: withMinAmountOut(args.call, minAmountOut) }
      : { ...args, min_amount_out: minAmountOut }
  return { ...call, value: { ...call.value, value: next } }
}

/**
 * A single Aave hop into the collateral is a fee-free unwrap that returns exactly
 * what it sells, so it deposits the full amount (less the runtime's rounding
 * buffer) and the sell is told to accept nothing less. Every other route deposits
 * the sell's slippage-protected minimum.
 */
export const readSwapDeposit = (
  tradeCall: unknown,
  {
    assetIn,
    collateralId,
    quotedAmountIn,
  }: { assetIn: string; collateralId: string; quotedAmountIn: bigint },
) => {
  const sell = readSellLimit(tradeCall)
  if (
    !sell ||
    String(sell.assetIn) !== assetIn ||
    String(sell.assetOut) !== collateralId
  )
    throw new Error("The swap does not buy this vault's collateral")

  const hop = sell.route?.length === 1 ? sell.route[0] : undefined
  const exact =
    hop?.pool === "Aave" &&
    hop.assetIn === sell.assetIn &&
    hop.assetOut === sell.assetOut
  if (!exact)
    return { exact, depositAmount: sell.minAmountOut, tradeCall } as const

  const depositAmount = (sell.amountIn ?? quotedAmountIn) - AAVE_ROUNDING_BUFFER
  if (depositAmount <= 0n) throw new Error("The swap amount is too small")
  return {
    exact,
    depositAmount,
    tradeCall: withMinAmountOut(tradeCall, depositAmount),
  } as const
}

/** deposits what readSwapDeposit guarantees, never more than the trade delivers */
export const prepareSwapDeposit = async (
  client: PublicClient,
  {
    collateralId,
    assetIn,
    quotedAmountIn,
    tradeCall,
    ...input
  }: Omit<DepositInput, "amount"> & {
    collateralId: string
    assetIn: string
    quotedAmountIn: bigint
    tradeCall: unknown
  },
) => {
  const { exact, depositAmount: amount } = readSwapDeposit(tradeCall, {
    assetIn,
    collateralId,
    quotedAmountIn,
  })
  return {
    exact,
    amount,
    approval: await prepareApproval(client, { ...input, amount }),
  }
}
