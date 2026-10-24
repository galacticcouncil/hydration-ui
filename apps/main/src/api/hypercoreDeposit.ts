/**
 * Hydration → Hyperliquid (HyperCore) USDC deposits over the xc-swap rail.
 *
 * A copy of xc-swap 0.9.0's `swap()` and `buildCall()` (trade/swap.ts), which
 * always ask 1Click for FLEX_INPUT. HyperCore only accepts EXACT_INPUT or
 * EXACT_OUTPUT, so this quotes EXACT_INPUT instead. Delete it once xc-swap
 * picks the swap type per destination.
 */
import type { SdkCtx } from "@galacticcouncil/sdk-next"
import {
  buildCalls,
  DEFAULT_ONE_CLICK_BASE_URL,
  DEFAULT_QUOTER_URL,
  DEFAULT_RELAY_MARGIN_PCT,
  fetchMaxRelayFee,
  fetchOneClickTokens,
  fetchRailConfig,
  fetchRailState,
  MIN_WETH,
  ONE_CLICK_ORIGIN_ASSET,
  padDown,
  pctToBps,
  trim,
  TRIM_UNIT,
  WETH_ID,
  XcSwapError,
} from "@galacticcouncil/xc-swap"
import { queryOptions } from "@tanstack/react-query"
import { isNumber, isPlainObject, isString } from "remeda"
import { erc20Abi } from "viem"

import type { TProviderContext } from "@/providers/rpcProvider"

/** USDC on Hyperliquid's HyperCore, as 1Click lists it. */
export const HYPERCORE_USDC_ASSET =
  "1cs_v1:hypercore:hip1:0x6d1e7cde53ba9467b783cb7c530ce054"

/**
 * xc-swap's `DEFAULT_DISTRIBUTION_CHANNEL`, which it does not export. It
 * identifies Hydration to 1Click; quotes without it fall outside that channel.
 */
const ONE_CLICK_DISTRIBUTION_TOKEN =
  "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjIwMjUtMDEtMTItdjEifQ.eyJ2IjoxLCJrZXlfdHlwZSI6ImRpc3RyaWJ1dGlvbl9jaGFubmVsIiwicGFydG5lcl9pZCI6Imh5ZHJhdGlvbiIsImlhdCI6MTc4MTg3MjQzNywiZXhwIjoxODEzNDA4NDM3fQ.JOLeSM9F4PiyCCpT2xsoLm3hsS77hT4JjyNVxw_8PpENkIKsLFtSpTPUH6eN2cmSXtuAGiJ9UV44anBHL76j19uYvTqZaJNTDoRMB0oUd6WNKiaQJQXs2UmjYOOKNNvBlQU-i8H7bw5tN_yf-rzKuuj-VRNU6TcAhNDkhnWnFChFG4UTd-9V4Ktd5stAFX1VdaWDW9ueBQDkF-dcmrjXBlM44G2UTy3HP65XvzIhYpIRv_CusUkBTipk8nHnkdjXtFBuds2okzI875LLRzf8ANx3HBzdjZsuHbHeBLIPwZcueV2KkkfeEoa2bLRnaXS3IfIhY13N666wyeea0HvUvA"

/** Matches xc-swap's default quote deadline. */
const QUOTE_DEADLINE_MS = 30 * 60 * 1000

export type HypercoreDepositParams = {
  /** IntentEmitter proxy on Hydration EVM. */
  readonly emitter: string
  /** Hydration runtime id of the asset sold. */
  readonly assetIn: number
  /** Its ERC-20 precompile on Hydration EVM. */
  readonly assetInAddress: `0x${string}`
  /** Smallest unit of the asset sold. */
  readonly amountIn: bigint
  /** Hyperliquid account the USDC lands in. */
  readonly recipient: string
  /** Hydration EVM sender, and where 1Click refunds ETH on Ethereum. */
  readonly refundTo: string
  /** Percent, 1 = 1%. */
  readonly slippage: number
}

/** WETH-valued figures are wei; output figures are HyperCore USDC units. */
export type HypercoreDepositQuote = {
  readonly params: HypercoreDepositParams
  readonly deadline: number
  /** WETH out of the Hydration sell, before the rail's cost. */
  readonly wethOut: bigint
  /** What the settlement carries, net of the rail's cost and quantized. */
  readonly bridged: bigint
  /** Floor passed to `placeOrder`. */
  readonly minEthOut: bigint
  /** Relay fee ceiling carried in the forwarding instruction. */
  readonly maxRelayFee: bigint
  /** What 1Click converts: the least that can land. */
  readonly quotedAmount: bigint
  /** ETH that comes back to `refundTo` on Ethereum, at least. */
  readonly refund: bigint
  /** Rail cost, quantization dust and the relay fee ceiling. */
  readonly fee: bigint
  readonly feeUsd: number
  readonly feePct: number
  readonly amountOut: bigint
  readonly minAmountOut: bigint
  /** 1Click leg only, seconds. */
  readonly timeEstimate: number
  readonly priceImpactPct: number
  /** Viability issues, reported instead of thrown. */
  readonly errors: XcSwapError[]
}

type OneClickQuote = {
  readonly amountOut: string
  readonly minAmountOut: string
  readonly amountInUsd?: string
  readonly timeEstimate?: number
  readonly depositAddress?: string
}

type QuoteLeg = Pick<HypercoreDepositParams, "recipient" | "refundTo"> & {
  readonly amount: bigint
  readonly slippageBps: number
  readonly deadline: number
  readonly dry: boolean
}

const parseQuote = (
  body: unknown,
): { quote: OneClickQuote; correlationId: string } | null => {
  if (!isPlainObject(body) || !isPlainObject(body.quote)) return null
  const { quote, correlationId } = body
  if (!isString(quote.amountOut) || !isString(quote.minAmountOut)) return null

  return {
    correlationId: isString(correlationId) ? correlationId : "",
    quote: {
      amountOut: quote.amountOut,
      minAmountOut: quote.minAmountOut,
      amountInUsd: isString(quote.amountInUsd) ? quote.amountInUsd : undefined,
      timeEstimate: isNumber(quote.timeEstimate)
        ? quote.timeEstimate
        : undefined,
      depositAddress: isString(quote.depositAddress)
        ? quote.depositAddress
        : undefined,
    },
  }
}

/** The request xc-swap's `getOneClickQuote` sends, but EXACT_INPUT. */
const requestQuote = async ({
  amount,
  recipient,
  refundTo,
  slippageBps,
  deadline,
  dry,
}: QuoteLeg) => {
  const res = await fetch(`${DEFAULT_ONE_CLICK_BASE_URL}/v0/quote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ONE_CLICK_DISTRIBUTION_TOKEN}`,
    },
    body: JSON.stringify({
      dry,
      swapType: "EXACT_INPUT",
      slippageTolerance: slippageBps,
      originAsset: ONE_CLICK_ORIGIN_ASSET,
      depositType: "ORIGIN_CHAIN",
      destinationAsset: HYPERCORE_USDC_ASSET,
      amount: amount.toString(),
      referral: "hydration",
      refundTo,
      refundType: "ORIGIN_CHAIN",
      recipient,
      recipientType: "DESTINATION_CHAIN",
      deadline: new Date(deadline).toISOString(),
    }),
  })
  const body: unknown = await res.json().catch(() => null)

  if (!res.ok) {
    const message =
      isPlainObject(body) && isString(body.message) ? body.message : ""
    throw new Error(message || `1Click quote failed (${res.status})`)
  }

  const parsed = parseQuote(body)
  if (!parsed) throw new Error("1Click returned an unexpected quote")

  return parsed
}

/** xc-swap's mapping of 1Click API errors. */
const mapQuoteError = (error: unknown): XcSwapError => {
  const message = (error instanceof Error ? error.message : "").toLowerCase()
  if (message.includes("recipient")) return XcSwapError.RecipientInvalid
  if (message.includes("too low")) return XcSwapError.AmountTooLow
  return XcSwapError.QuoteFailed
}

export const quoteHypercoreDeposit = async (
  sdk: SdkCtx,
  params: HypercoreDepositParams,
): Promise<HypercoreDepositQuote> => {
  const slippageBps = pctToBps(params.slippage)
  const deadline = Date.now() + QUOTE_DEADLINE_MS
  const provider = sdk.client.evm.getProvider()

  const [sell, maxRelayFee, rail] = await Promise.all([
    params.assetIn === WETH_ID
      ? { amountOut: params.amountIn, priceImpactPct: 0 }
      : sdk.api.router.getBestSell(params.assetIn, WETH_ID, params.amountIn),
    fetchMaxRelayFee({
      quoterUrl: DEFAULT_QUOTER_URL,
      chain: "ethereum",
      marginBps: pctToBps(DEFAULT_RELAY_MARGIN_PCT),
    }),
    fetchRailConfig(provider, params.emitter).then((config) =>
      fetchRailState(provider, config),
    ),
  ])

  const wethOut = sell.amountOut
  const bridged =
    wethOut > rail.cost ? trim(wethOut - rail.cost, TRIM_UNIT) : 0n
  const minEthOut = trim(padDown(bridged, slippageBps), TRIM_UNIT)
  const swapAmount = bridged > maxRelayFee ? bridged - maxRelayFee : 0n

  // Least that lands: the emitter reverts below `minEthOut` and the receiver
  // pays the relayer at most `maxRelayFee`. An EXACT_INPUT deposit short of
  // its quote is refunded whole, so the quote is sized to this floor and
  // what lands above it comes back to `refundTo`.
  const quotedAmount = minEthOut > maxRelayFee ? minEthOut - maxRelayFee : 0n
  const refund = swapAmount > quotedAmount ? swapAmount - quotedAmount : 0n

  const errors: XcSwapError[] = []
  if (rail.paused) errors.push(XcSwapError.RailPaused)
  if (wethOut <= rail.cost) {
    errors.push(XcSwapError.BelowDeliveryPrice)
  } else if (bridged === 0n) {
    errors.push(XcSwapError.BelowTrimUnit)
  }
  if (bridged > rail.capacity) errors.push(XcSwapError.RailRateLimited)
  if (maxRelayFee >= bridged || quotedAmount === 0n) {
    errors.push(XcSwapError.RelayFeeExceedsAmount)
  } else if (bridged < 2n * maxRelayFee) {
    errors.push(XcSwapError.RelayFeeTooHigh)
  }
  if (minEthOut < MIN_WETH) errors.push(XcSwapError.MinWethNotMet)

  // Priced at the floor itself, so a too-low amount shows in the estimate.
  let quote: OneClickQuote | undefined
  if (quotedAmount > 0n) {
    try {
      const res = await requestQuote({
        amount: quotedAmount,
        recipient: params.recipient,
        refundTo: params.refundTo,
        slippageBps,
        deadline,
        dry: true,
      })
      quote = res.quote
    } catch (error) {
      errors.push(mapQuoteError(error))
    }
  }

  // The refund comes back, so it is not part of the fee.
  const fee = wethOut > swapAmount ? wethOut - swapAmount : 0n
  const feeUsd =
    quote?.amountInUsd && quotedAmount > 0n
      ? (parseFloat(quote.amountInUsd) * Number(fee)) / Number(quotedAmount)
      : 0

  return {
    params,
    deadline,
    wethOut,
    bridged,
    minEthOut,
    maxRelayFee,
    quotedAmount,
    refund,
    fee,
    feeUsd,
    feePct: wethOut > 0n ? Number((fee * 10_000n) / wethOut) / 100 : 0,
    amountOut: quote ? BigInt(quote.amountOut) : 0n,
    minAmountOut: quote ? BigInt(quote.minAmountOut) : 0n,
    timeEstimate: quote?.timeEstimate ?? 0,
    priceImpactPct: sell.priceImpactPct,
    errors,
  }
}

/**
 * Firm quote and the Hydration EVM calls, from the estimate the user saw.
 *
 * - Reuses its floor and fee ceiling, so `placeOrder` encodes what was quoted
 */
export const buildHypercoreDeposit = async (
  sdk: SdkCtx,
  quote: HypercoreDepositQuote,
) => {
  const { params } = quote
  if (quote.errors.length) {
    throw new Error(
      `Cannot build a non-viable deposit: ${quote.errors.join(", ")}`,
    )
  }

  const { quote: firm, correlationId } = await requestQuote({
    amount: quote.quotedAmount,
    recipient: params.recipient,
    refundTo: params.refundTo,
    slippageBps: pctToBps(params.slippage),
    deadline: quote.deadline,
    dry: false,
  })
  const depositAddress = firm.depositAddress
  if (!depositAddress) {
    throw new Error("1Click did not return a deposit address")
  }

  const allowance = await sdk.client.evm.getProvider().readContract({
    abi: erc20Abi,
    address: params.assetInAddress,
    functionName: "allowance",
    args: [params.refundTo as `0x${string}`, params.emitter as `0x${string}`],
  })

  const calls = buildCalls({
    from: params.refundTo,
    assetInAddress: params.assetInAddress,
    emitter: params.emitter,
    assetIn: params.assetIn,
    amountIn: params.amountIn,
    minEthOut: quote.minEthOut,
    depositAddress,
    maxRelayFee: quote.maxRelayFee,
    approved: allowance >= params.amountIn,
  })

  return { calls, depositAddress, correlationId }
}

export const hypercoreDepositQuoteQuery = (
  { sdk }: TProviderContext,
  params: HypercoreDepositParams | null,
) =>
  queryOptions({
    queryKey: [
      "hypercoreDeposit",
      "quote",
      params?.assetIn,
      params?.amountIn.toString(),
      params?.recipient,
      params?.refundTo,
      params?.slippage,
    ],
    queryFn: () => {
      if (!params) throw new Error("Deposit params are required")
      return quoteHypercoreDeposit(sdk, params)
    },
    enabled: !!params,
    retry: false,
  })

/** HyperCore USDC as 1Click lists it, for its decimals and symbol. */
export const hypercoreUsdcTokenQuery = ({ isReady }: TProviderContext) =>
  queryOptions({
    queryKey: ["hypercoreDeposit", "token", HYPERCORE_USDC_ASSET],
    queryFn: async () => {
      const tokens = await fetchOneClickTokens()
      return tokens.find((t) => t.assetId === HYPERCORE_USDC_ASSET) ?? null
    },
    enabled: isReady,
    staleTime: Infinity,
    retry: false,
  })
