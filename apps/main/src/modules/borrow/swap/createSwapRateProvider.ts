import { valueToWei } from "@aave/contract-helpers"
import { normalize } from "@aave/math-utils"
import {
  OptimalRate,
  SwapRateProvider,
} from "@galacticcouncil/money-market/hooks"
import { SdkCtx } from "@galacticcouncil/sdk-next"
import Big from "big.js"

import { TErc20, TErc20AToken } from "@/api/assets"
import { getSpotPrice } from "@/api/spotPrice"
import i18n from "@/i18n"
import {
  getCollateralRoutingAssetId,
  getRoutingAssetId,
} from "@/modules/borrow/swap/getRoutingAssetId"
import { AssetId, TAsset } from "@/providers/assetsProvider"
import {
  TransactionInput,
  TransactionOptions,
  TSuccessResult,
} from "@/states/transactions"
import { scaleHuman } from "@/utils/formatting"

type GetAsset = (id: AssetId) => TAsset | undefined
type GetRelatedAToken = (id: AssetId) => TErc20 | undefined
type IsErc20AToken = (asset: TAsset) => asset is TErc20AToken
type CreateTransaction = (
  transaction: TransactionInput,
  options?: TransactionOptions,
) => Promise<TSuccessResult>

export type SwapRateProviderDeps = {
  sdk: SdkCtx
  getAsset: GetAsset
  getRelatedAToken: GetRelatedAToken
  isErc20AToken: IsErc20AToken
  stableCoinId: string | undefined
  createTransaction: CreateTransaction
  ghoTokenAddress?: string
}

/**
 * Hydration-native `SwapRateProvider` backed by the on-chain trade router
 * (`sdk.api.router.getBestSell` / `getBestBuy`) — the same SDK calls the Trade
 * Market screen uses. Money-market reserve EVM `underlyingAsset` addresses are
 * resolved to Hydration numeric asset IDs via {@link getRoutingAssetId} before
 * the router is queried.
 *
 * The rate methods and the native collateral-swap submit
 * ({@link SwapRateProvider.submitCollateralSwap}) are implemented here; the
 * ParaSwap-style `*TxParams` builders remain unimplemented and throw a neutral
 * error (the legacy Aave/ParaSwap path owns those).
 */
export const createSwapRateProvider = ({
  sdk,
  getAsset,
  getRelatedAToken,
  isErc20AToken,
  stableCoinId,
  createTransaction,
  ghoTokenAddress,
}: SwapRateProviderDeps): SwapRateProvider => {
  const resolveAssetId = (underlyingAsset: string): string => {
    const assetId = getRoutingAssetId(
      underlyingAsset,
      getAsset,
      isErc20AToken,
      getRelatedAToken,
      ghoTokenAddress,
    )
    if (!assetId) {
      throw new Error("Unable to resolve a Hydration asset for this swap pair")
    }
    return assetId
  }

  /**
   * Collateral-swap variant: routes aToken → aToken (e.g. aDOT → aPRIME) since
   * money-market collateral is held as aTokens. Debt-switch keeps using
   * {@link resolveAssetId} (underlying routing).
   */
  const resolveCollateralAssetId = (underlyingAsset: string): string => {
    const assetId = getCollateralRoutingAssetId(
      underlyingAsset,
      getAsset,
      isErc20AToken,
      getRelatedAToken,
      ghoTokenAddress,
    )
    if (!assetId) {
      throw new Error("Unable to resolve a Hydration asset for this swap pair")
    }
    return assetId
  }

  /**
   * Human-readable USD value of `baseAmount` (base-unit / wei string) for the
   * resolved Hydration `assetId`, using the same spot-price source the rest of
   * the app consumes ({@link getSpotPrice} against the display stablecoin).
   * Falls back to "0" when no spot price is available — never throws.
   */
  const toUSD = async (
    assetId: string,
    baseAmount: string,
    decimals: number,
  ): Promise<string> => {
    try {
      const { spotPrice } = await getSpotPrice(
        sdk.api.router,
        assetId,
        stableCoinId ?? "",
      )()
      if (!spotPrice) return "0"
      return Big(normalize(baseAmount, decimals)).times(spotPrice).toString()
    } catch {
      return "0"
    }
  }

  const fetchExactInRate: SwapRateProvider["fetchExactInRate"] = async (
    swapIn,
    swapOut,
  ) => {
    const assetIn = resolveCollateralAssetId(swapIn.underlyingAsset)
    const assetOut = resolveCollateralAssetId(swapOut.underlyingAsset)

    const trade = await sdk.api.router.getBestSell(
      Number(assetIn),
      Number(assetOut),
      swapIn.amount,
    )

    const srcAmount = valueToWei(swapIn.amount, swapIn.decimals)
    const destAmount = trade.amountOut.toString()
    const [srcUSD, destUSD] = await Promise.all([
      toUSD(assetIn, srcAmount, swapIn.decimals),
      toUSD(assetOut, destAmount, swapOut.decimals),
    ])

    return {
      srcToken: swapIn.underlyingAsset,
      srcDecimals: swapIn.decimals,
      srcAmount,
      srcUSD,
      destToken: swapOut.underlyingAsset,
      destDecimals: swapOut.decimals,
      destAmount,
      destUSD,
      priceImpactPct: trade.priceImpactPct,
    } satisfies OptimalRate
  }

  const fetchExactOutRate: SwapRateProvider["fetchExactOutRate"] = async (
    swapIn,
    swapOut,
  ) => {
    const assetIn = resolveAssetId(swapIn.underlyingAsset)
    const assetOut = resolveAssetId(swapOut.underlyingAsset)

    const trade = await sdk.api.router.getBestBuy(
      Number(assetIn),
      Number(assetOut),
      swapOut.amount,
    )

    const srcAmount = trade.amountIn.toString()
    const destAmount = valueToWei(swapOut.amount, swapOut.decimals)
    const [srcUSD, destUSD] = await Promise.all([
      toUSD(assetIn, srcAmount, swapIn.decimals),
      toUSD(assetOut, destAmount, swapOut.decimals),
    ])

    return {
      srcToken: swapIn.underlyingAsset,
      srcDecimals: swapIn.decimals,
      srcAmount,
      srcUSD,
      destToken: swapOut.underlyingAsset,
      destDecimals: swapOut.decimals,
      destAmount,
      destUSD,
      priceImpactPct: trade.priceImpactPct,
    } satisfies OptimalRate
  }

  /**
   * Build AND submit the native collateral-swap transaction (exact-in / Sell).
   * Routes the aToken pair (aDOT → aPRIME) through the on-chain trade router —
   * the same `sdk.tx.trade(...).withSlippage().withBeneficiary().build()` flow
   * the Trade Market screen uses ({@link file://useSubmitSwap.ts}) — then submits
   * `tx.get()` via the app `createTransaction` with Market-Swap-style toasts.
   *
   * `userAddress` is the connected wallet's SS58 address (same as Market Swap's
   * `withBeneficiary`); the SDK uses it for substrate balance checks during
   * `tx.build()` and as the trade beneficiary so swapped aTokens remain collateral.
   */
  const submitCollateralSwap: SwapRateProvider["submitCollateralSwap"] = async (
    _route,
    swapIn,
    swapOut,
    _chainId,
    userAddress,
    maxSlippage,
  ) => {
    const assetIn = resolveCollateralAssetId(swapIn.underlyingAsset)
    const assetOut = resolveCollateralAssetId(swapOut.underlyingAsset)

    const trade = await sdk.api.router.getBestSell(
      Number(assetIn),
      Number(assetOut),
      swapIn.amount,
    )

    const tx = await sdk.tx
      .trade(trade)
      .withSlippage(maxSlippage)
      .withBeneficiary(userAddress)
      .build()

    const inLabel = i18n.t("currency", {
      value: scaleHuman(trade.amountIn.toString(), swapIn.decimals),
      symbol: getAsset(assetIn)?.symbol ?? "",
    })
    const outLabel = i18n.t("currency", {
      value: scaleHuman(trade.amountOut.toString(), swapOut.decimals),
      symbol: getAsset(assetOut)?.symbol ?? "",
    })

    createTransaction({
      tx: tx.get(),
      toasts: {
        submitted: i18n.t("trade:market.swap.sell.loading", {
          in: inLabel,
          out: outLabel,
        }),
        success: i18n.t("trade:market.swap.sell.success", {
          in: inLabel,
          out: outLabel,
        }),
        error: i18n.t("trade:market.swap.sell.error", {
          in: inLabel,
          out: outLabel,
        }),
      },
    })
  }

  const notYetImplemented = (): never => {
    throw new Error("Swap transaction creation is not yet implemented")
  }

  return {
    fetchExactInRate,
    fetchExactOutRate,
    fetchExactInTxParams: notYetImplemented,
    submitCollateralSwap,
    fetchExactOutTxParams: notYetImplemented,
  }
}
