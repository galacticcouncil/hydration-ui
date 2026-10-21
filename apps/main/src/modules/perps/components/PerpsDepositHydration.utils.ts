import {
  getAddressFromAssetId,
  HYDRATION_CHAIN_KEY,
  isH160Address,
  USDC_ASSET_ID,
  withTimeout,
} from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { WETH_ID } from "@galacticcouncil/xc-swap"
import { useMutation, useQuery } from "@tanstack/react-query"
import { minutesToMilliseconds } from "date-fns"
import waitFor from "p-wait-for"
import { useTranslation } from "react-i18next"

import { TAssetData } from "@/api/assets"
import { useAccountBalances } from "@/api/balances"
import { useErc20Allowance } from "@/api/evm"
import {
  buildHypercoreDeposit,
  HypercoreDepositParams,
  hypercoreDepositQuoteQuery,
  hypercoreUsdcTokenQuery,
} from "@/api/hypercoreDeposit"
import { PendingApproval } from "@/components/PendingApproval"
import { XC_SWAP_CONFIG } from "@/config/xcSwap"
import { usePerpsAddress } from "@/modules/perps/PerpsPage.data"
import { AnyTransaction } from "@/modules/transactions/types"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTradeSettings } from "@/states/tradeSettings"
import {
  TransactionActions,
  TransactionType,
  TransactionXcSwapMeta,
  useTransactionsStore,
} from "@/states/transactions"
import { getErrorMessage } from "@/utils/errors"
import { scale, scaleHuman } from "@/utils/formatting"

const BUILD_CALL_TIMEOUT_MS = 30_000

/** 1Click's chain id; toasts and history fall back to it as the chain name. */
const HYPERCORE_CHAIN_KEY = "hypercore"
const DESTINATION_NAME = "Hyperliquid"

export type PerpsDepositRoute = {
  readonly usdc: TAssetData | null
  /** HyperCore USDC as 1Click lists it. */
  readonly output: { readonly symbol: string; readonly decimals: number } | null
  /** WETH, the bridged asset the fee and refund are valued in. */
  readonly bridged: {
    readonly symbol: string
    readonly decimals: number
  } | null
  /** Transferable Hydration USDC, in human units. */
  readonly balance: string
  /** Hyperliquid account the USDC lands in. */
  readonly recipient: string
  /** Hydration EVM sender, which is also where 1Click refunds on Ethereum. */
  readonly refundTo: string | null
  readonly slippage: number
}

/**
 * Hydration USDC → HyperCore USDC: sold for WETH on Hydration, bridged to
 * Ethereum, then swapped by 1Click into the Hyperliquid account.
 */
export const usePerpsDepositRoute = (): PerpsDepositRoute => {
  const rpc = useRpcProvider()
  const { account } = useAccount()
  const { getAsset } = useAssets()
  const { getTransferableBalance } = useAccountBalances()
  const recipient = usePerpsAddress()
  const {
    swap: {
      single: { swapSlippage },
    },
  } = useTradeSettings()
  const { data: token } = useQuery(hypercoreUsdcTokenQuery(rpc))

  const usdc = getAsset(USDC_ASSET_ID) ?? null
  const weth = getAsset(WETH_ID)

  return {
    usdc,
    output: token ? { symbol: token.symbol, decimals: token.decimals } : null,
    bridged: weth ? { symbol: weth.symbol, decimals: weth.decimals } : null,
    balance: usdc
      ? scaleHuman(getTransferableBalance(usdc.id), usdc.decimals)
      : "0",
    recipient,
    refundTo: isH160Address(account?.rawAddress) ? account.rawAddress : null,
    slippage: swapSlippage,
  }
}

/** Null until everything the quote needs is known. */
const getDepositParams = (
  route: PerpsDepositRoute,
  amount: string,
): HypercoreDepositParams | null => {
  const { usdc, recipient, refundTo, slippage } = route
  if (!usdc || !recipient || !refundTo || !amount) return null

  const amountIn = BigInt(scale(amount, usdc.decimals))
  if (amountIn <= 0n) return null

  return {
    emitter: XC_SWAP_CONFIG.emitter,
    assetIn: Number(usdc.id),
    assetInAddress: getAddressFromAssetId(usdc.id) as `0x${string}`,
    amountIn,
    recipient,
    refundTo,
    slippage,
  }
}

export const usePerpsDepositQuote = (
  route: PerpsDepositRoute,
  amount: string,
) => {
  const rpc = useRpcProvider()

  return useQuery(
    hypercoreDepositQuoteQuery(rpc, getDepositParams(route, amount)),
  )
}

/**
 * The swap page's `useSubmitXcSwap`, pointed at `api/hypercoreDeposit`:
 * approve, then `placeOrder`, under the same xc-swap toasts and history.
 * Delete with that module once xc-swap can quote HyperCore itself.
 */
export const usePerpsDepositSubmit = (
  route: PerpsDepositRoute,
  actions?: TransactionActions,
) => {
  const { t } = useTranslation(["common", "trade"])
  const rpc = useRpcProvider()
  const { createTransaction } = useTransactionsStore()
  const getErc20Allowance = useErc20Allowance()

  const submit = useMutation({
    mutationFn: async (amount: string) => {
      const { usdc, output, bridged } = route
      const params = getDepositParams(route, amount)
      if (!usdc || !output || !bridged || !params) {
        throw new Error("Deposit is not ready")
      }

      // Fresh estimate, so the firm quote matches the current rail and fees.
      const quote = await rpc.queryClient.fetchQuery(
        hypercoreDepositQuoteQuery(rpc, params),
      )

      const meta: TransactionXcSwapMeta = {
        type: TransactionType.XcSwap,
        srcChainKey: HYDRATION_CHAIN_KEY,
        srcAssetSymbol: usdc.symbol,
        srcAmount: amount,
        srcChainFee: scaleHuman(quote.fee, bridged.decimals),
        srcChainFeeSymbol: bridged.symbol,
        dstChainKey: HYPERCORE_CHAIN_KEY,
        dstAssetSymbol: output.symbol,
        dstAmount: scaleHuman(quote.amountOut, output.decimals),
        dstAddress: params.recipient,
      }

      let built: Awaited<ReturnType<typeof buildHypercoreDeposit>>
      try {
        built = await withTimeout(
          buildHypercoreDeposit(rpc.sdk, quote),
          BUILD_CALL_TIMEOUT_MS,
        )
      } catch (buildError) {
        const isTimeout =
          buildError instanceof Error && buildError.name === "TimeoutError"
        return createTransaction(
          {
            initialError: isTimeout
              ? t("trade:xc.swap.error.routeTimeoutRetry")
              : getErrorMessage(buildError),
            meta,
            // tx is unused when initialError is set; review modal skips signing.
            tx: {} as AnyTransaction,
          },
          actions,
        )
      }

      const { calls, depositAddress, correlationId } = built
      const placeOrder = calls[calls.length - 1]
      if (!placeOrder) throw new Error("Failed to build the deposit call")
      const approve = calls.length > 1 ? calls[0] : undefined

      const i18nVars = {
        amount,
        symbol: usdc.symbol,
        dstSymbol: output.symbol,
        dstChain: DESTINATION_NAME,
      }
      const toasts = {
        submitted: t("trade:xc.swap.toast.submitted", i18nVars),
        success: t("trade:xc.swap.toast.success", i18nVars),
      }
      const txMeta: TransactionXcSwapMeta = {
        ...meta,
        depositAddress,
        correlationId,
      }

      if (!approve) {
        return createTransaction(
          { tx: placeOrder, toasts, meta: txMeta },
          actions,
        )
      }

      return createTransaction(
        {
          tx: [
            {
              tx: approve,
              stepTitle: t("trade:xc.swap.step.approve"),
              toasts: {
                submitted: t("trade:xc.swap.approve.toast.submitted", {
                  symbol: usdc.symbol,
                }),
                success: t("trade:xc.swap.approve.toast.success", {
                  symbol: usdc.symbol,
                }),
              },
              meta: {
                type: TransactionType.EvmApprove,
                srcChainKey: HYDRATION_CHAIN_KEY,
              },
              pendingComponent: PendingApproval,
              beforeNext: async () => {
                await waitFor(
                  async () => {
                    const allowance = await getErc20Allowance(
                      approve.to,
                      approve.from,
                      XC_SWAP_CONFIG.emitter,
                    )
                    return allowance >= params.amountIn
                  },
                  {
                    interval: 1000,
                    timeout: {
                      milliseconds: minutesToMilliseconds(3),
                      message: t("trade:xc.swap.approve.timeout"),
                    },
                  },
                )
              },
            },
            {
              tx: placeOrder,
              stepTitle: t("trade:perps.deposit.title"),
              toasts,
              meta: txMeta,
            },
          ],
        },
        actions,
      )
    },
  })

  return { deposit: submit.mutate, isPending: submit.isPending }
}
