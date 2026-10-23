import { minutesToMilliseconds } from "date-fns"
import waitFor from "p-wait-for"
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
import {
  depositBlocker,
  readMainDebtBusy,
} from "@/modules/strategies/propeller/utils/depositGates"
import { type TProviderContext } from "@/providers/rpcProvider"

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

/** Deposit at most the vault's remaining room. */
export const clampDeposit = (delivered: bigint, maximum: bigint) =>
  delivered < maximum ? delivered : maximum

/** how long to wait for a node to catch up with a landed transaction */
export const CHAIN_WAIT = { interval: 1000, timeout: minutesToMilliseconds(3) }

/** Select a best state containing the swap, without waiting for finalization. */
export const waitForSwapBlock = async (
  { papi, papiClient }: Pick<TProviderContext, "papi" | "papiClient">,
  swap: { number: number; hash?: string },
  wait = CHAIN_WAIT,
) =>
  waitFor(async () => {
    const blocks = await papiClient.getBestBlocks()
    const best = blocks[0]
    if (!best || best.number < swap.number) return false

    if (swap.hash) {
      // System records ancestor hashes; the current block's own hash comes from the head.
      const hash =
        best.number === swap.number
          ? best.hash
          : await papi.query.System.BlockHash.getValue(swap.number, {
              at: best.hash,
            })
      if (hash !== swap.hash)
        throw new Error("The swap is no longer in the best chain")
    }

    // Pin the checked best state so the dry-run cannot select a different head.
    return waitFor.resolveWith(best.hash)
  }, wait)

// a node answers a read pinned to a block it has not imported with this
const isMissingBlock = (error: unknown) =>
  error instanceof Error && error.message.includes("header not found")

/** Collateral a swap delivered: the owner's balance at its block minus the block before. */
export const readDelivered = async (
  client: PublicClient,
  { asset, owner, block }: { asset: Hex; owner: Hex; block: bigint },
  wait = CHAIN_WAIT,
) => {
  const balanceAt = (blockNumber: bigint) =>
    client.readContract({
      address: asset,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [owner],
      blockNumber,
    })
  const [before, after] = await waitFor(
    () =>
      Promise.all([balanceAt(block - 1n), balanceAt(block)]).then(
        waitFor.resolveWith,
        (error) => {
          if (isMissingBlock(error)) return false
          throw error
        },
      ),
    wait,
  )
  const delivered = after - before
  if (delivered <= 0n) throw new Error("The swap delivered nothing to deposit")
  return delivered
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

/** The swap landed but its deposit can't be prepared; delivered is unknown if unreadable. */
export class InterruptedDepositError extends Error {
  delivered: bigint | undefined
  constructor(delivered: bigint | undefined, options: ErrorOptions) {
    super("The deposit after the swap could not be prepared", options)
    this.delivered = delivered
  }
}

/** Deposits what a swap landed in `block` delivered, clamped to the vault's room. */
export const prepareDeliveredDeposit = async (
  client: PublicClient,
  { block, ...input }: Omit<DepositInput, "amount"> & { block: bigint },
  wait = CHAIN_WAIT,
) => {
  let delivered: bigint | undefined
  try {
    delivered = await readDelivered(client, { ...input, block }, wait)
    // The EVM node must have imported the swap before preparing its deposit.
    await waitFor(async () => (await client.getBlockNumber()) >= block, wait)
    const { vault, asset } = input
    const { maximum } = await readDepositCapacity(client, vault, asset)
    const amount = clampDeposit(delivered, maximum)
    // also asserts the vault is ready, unpaused and has room
    const approval = await prepareApproval(client, { ...input, amount })
    return { delivered, amount, approval }
  } catch (cause) {
    throw new InterruptedDepositError(delivered, { cause })
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

/**
 * A 1:1 unwrap deposits its full amount and the sell accepts nothing less. Any
 * other route only reports its minimum: the deposit is sized after it lands.
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

  const depositAmount = readUnwrapDeposit(sell.route, {
    ...sell,
    amountIn: sell.amountIn ?? quotedAmountIn,
  })
  if (depositAmount === null)
    return { exact: false, minAmountOut: sell.minAmountOut, tradeCall } as const
  return {
    exact: true,
    depositAmount,
    tradeCall: withMinAmountOut(tradeCall, depositAmount),
  } as const
}

/**
 * A 1:1 unwrap approves its deposit for the swap's batch. Any other route only
 * checks the vault takes deposits, so the swap isn't stranded, and shows its minimum.
 */
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
  const swap = readSwapDeposit(tradeCall, {
    assetIn,
    collateralId,
    quotedAmountIn,
  })
  if (swap.exact) {
    const amount = swap.depositAmount
    return {
      exact: true,
      amount,
      approval: await prepareApproval(client, { ...input, amount }),
    }
  }
  // any room at all: the delivered amount is clamped to it after the swap
  assertDepositCapacity(
    await readDepositCapacity(client, input.vault, input.asset),
    1n,
  )
  return { exact: false, amount: swap.minAmountOut, approval: null }
}
