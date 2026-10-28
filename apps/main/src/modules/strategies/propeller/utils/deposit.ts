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
  DEPOSIT_BUFFER_BPS,
  DEPOSIT_MIN_GAS,
  EVM_CALL_GAS,
} from "@/modules/strategies/propeller/constants"
import {
  depositBlocker,
  readMainDebtBusy,
} from "@/modules/strategies/propeller/utils/depositGates"

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
  const deploying =
    mainDebt === zeroAddress
      ? null
      : await readMainDebtBusy(client, mainDebt, at.blockNumber)
  const blocker = depositBlocker({
    paused,
    depositsPaused,
    deficitStop,
    deleverPending: deleverTarget > 0n,
    deploying,
  })
  return {
    blockNumber: at.blockNumber,
    maximum: cap > total ? cap - total : 0n,
    // Governance must bootstrap a fresh vault before opening public deposits.
    ready: supply > 0n && mainDebt !== zeroAddress,
    blocker,
    paused: blocker !== null,
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

export const isCallNode = (
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

/**
 * A single Aave hop into the collateral is a fee-free 1:1 unwrap: it deposits the
 * amount in less the runtime's rounding buffer. Null for any other route.
 */
export const readUnwrapDeposit = (
  route: readonly Hop[] | undefined,
  {
    assetIn,
    assetOut,
    amountIn,
  }: { assetIn: number; assetOut: number; amountIn: bigint },
) => {
  const hop = route?.length === 1 ? route[0] : undefined
  if (
    hop?.pool !== "Aave" ||
    hop.assetIn !== assetIn ||
    hop.assetOut !== assetOut
  )
    return null
  const amount = amountIn - AAVE_ROUNDING_BUFFER
  if (amount <= 0n) throw new Error("The swap amount is too small")
  return amount
}

const withMinAmountOut = (call: unknown, minAmountOut: bigint): unknown => {
  if (!isCallNode(call) || !isCallNode(call.value)) return call
  const args = call.value.value as Record<string, unknown>
  const next =
    call.type === "Dispatcher"
      ? { ...args, call: withMinAmountOut(args.call, minAmountOut) }
      : { ...args, min_amount_out: minAmountOut }
  return { ...call, value: { ...call.value, value: next } }
}

/** What a swap deposit can count on: its quote, less a small buffer for the price moving before inclusion. */
export const bufferedDeposit = (quotedAmountOut: bigint) =>
  quotedAmountOut - (quotedAmountOut * DEPOSIT_BUFFER_BPS) / 10_000n

/**
 * The sell's guaranteed minimum is what the batch deposits, so the deposit
 * amount is known when signing. A 1:1 unwrap deposits its full amount; any other
 * route deposits its buffered quote and accepts nothing less.
 */
export const readSwapDeposit = (
  tradeCall: unknown,
  {
    assetIn,
    collateralId,
    quotedAmountIn,
    quotedAmountOut,
  }: {
    assetIn: string
    collateralId: string
    quotedAmountIn: bigint
    quotedAmountOut: bigint
  },
) => {
  const sell = readSellLimit(tradeCall)
  if (
    !sell ||
    String(sell.assetIn) !== assetIn ||
    String(sell.assetOut) !== collateralId
  )
    throw new Error("The swap does not buy this vault's collateral")

  const unwrap = readUnwrapDeposit(sell.route, {
    ...sell,
    amountIn: sell.amountIn ?? quotedAmountIn,
  })
  const depositAmount = unwrap ?? bufferedDeposit(quotedAmountOut)
  if (depositAmount <= 0n) throw new Error("The swap amount is too small")
  return {
    exact: unwrap !== null,
    depositAmount,
    tradeCall: withMinAmountOut(tradeCall, depositAmount),
    /** sell_all leaves no pay asset to receive the sweep */
    sellsAll: sell.amountIn === undefined,
  } as const
}

/**
 * Sells whatever the swap delivered above its minimum back along the reverse
 * route, so no collateral (2-Pool-GETH) is left in the wallet. Sell-all is
 * sized at execution, so it needs no amount; it fails on a zero balance.
 */
export const sweepCall = (tradeCall: unknown): unknown => {
  if (!isCallNode(tradeCall) || !isCallNode(tradeCall.value)) return null
  const { type: method, value: args } = tradeCall.value
  if (!isPlainObject(args)) return null
  if (tradeCall.type === "Dispatcher" && method === "dispatch_with_extra_gas") {
    const call = sweepCall(args.call)
    return (
      call && {
        ...tradeCall,
        value: { ...tradeCall.value, value: { ...args, call } },
      }
    )
  }
  if (
    tradeCall.type !== "Router" ||
    !Array.isArray(args.route) ||
    !isNumber(args.asset_in) ||
    !isNumber(args.asset_out)
  )
    return null
  const route = (args.route as Record<string, unknown>[])
    .map((hop) => ({
      ...hop,
      asset_in: hop.asset_out,
      asset_out: hop.asset_in,
    }))
    .reverse()
  return {
    type: "Router",
    value: {
      type: "sell_all",
      value: {
        asset_in: args.asset_out,
        asset_out: args.asset_in,
        min_amount_out: 0n,
        route,
      },
    },
  }
}

/** Approves the swap's guaranteed minimum for the same batch, after checking the vault takes it. */
export const prepareSwapDeposit = async (
  client: PublicClient,
  {
    collateralId,
    assetIn,
    quotedAmountIn,
    quotedAmountOut,
    tradeCall,
    ...input
  }: Omit<DepositInput, "amount"> & {
    collateralId: string
    assetIn: string
    quotedAmountIn: bigint
    quotedAmountOut: bigint
    tradeCall: unknown
  },
) => {
  const swap = readSwapDeposit(tradeCall, {
    assetIn,
    collateralId,
    quotedAmountIn,
    quotedAmountOut,
  })
  const amount = swap.depositAmount
  return {
    ...swap,
    amount,
    approval: await prepareApproval(client, { ...input, amount }),
  }
}
