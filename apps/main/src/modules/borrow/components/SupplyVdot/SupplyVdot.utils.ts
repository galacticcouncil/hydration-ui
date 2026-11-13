import { ProtocolAction } from "@aave/contract-helpers"
import {
  ComputedUserReserveData,
  ExtendedFormattedUser,
  getAssetCapData,
  useProtocolActionToasts,
} from "@galacticcouncil/money-market/hooks"
import { queryKeysFactory } from "@galacticcouncil/money-market/ui-config"
import { getAssetCollateralType } from "@galacticcouncil/money-market/utils"
import { DOT_ASSET_ID, safeConvertAnyToH160 } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import Big from "big.js"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { first } from "remeda"
import * as z from "zod/v4"

import { healthFactorQuery } from "@/api/aave"
import { TAssetData, TErc20AToken } from "@/api/assets"
import { useAccountBalances } from "@/api/balances"
import {
  lendingPoolAddressProvider,
  useBorrowAssetsApy,
  userBorrowSummaryQueryKey,
} from "@/api/borrow"
import { bestSellWithTxQuery } from "@/api/trade"
import { VDOT_MINT_TOO_SMALL_ERROR, vdotMintSupplyQuery } from "@/api/vdot"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { useFormMaxBalanceWithFee } from "@/modules/transactions/hooks/useFormMaxBalanceWithFee"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTradeSettings } from "@/states/tradeSettings"
import { useTransactionsStore } from "@/states/transactions"
import { scaleHuman, toBigInt } from "@/utils/formatting"
import { maxBalanceError, validateMaxBalance } from "@/utils/validators"

export type SupplyVdotFormValues = {
  amount: string
  asset: TAssetData
}

type SupplyVdotArgs = {
  initialAsset: TAssetData
  vdot: TAssetData
  aToken: TErc20AToken
  userBorrowData: ExtendedFormattedUser
  userReserve: ComputedUserReserveData
  onSubmitted: () => void
}

export const useSupplyVdot = ({
  initialAsset,
  vdot,
  aToken,
  userBorrowData,
  userReserve,
  onSubmitted,
}: SupplyVdotArgs) => {
  const { t } = useTranslation(["common", "borrow"])
  const rpc = useRpcProvider()
  const { account } = useAccount()
  const address = account?.address ?? ""
  const queryClient = useQueryClient()
  const { createTransaction } = useTransactionsStore()
  const { getTransferableBalance } = useAccountBalances()
  const {
    swap: {
      single: { swapSlippage },
    },
  } = useTradeSettings()

  // The mint's XCM withdraw keeps the account alive, so DOT's ED stays behind
  const getBalance = (asset: TAssetData) => {
    const balance = scaleHuman(getTransferableBalance(asset.id), asset.decimals)
    if (asset.id !== DOT_ASSET_ID) return balance

    const ed = scaleHuman(asset.existentialDeposit, asset.decimals)
    return Big.max(0, Big(balance).minus(ed)).toString()
  }

  const form = useSupplyVdotForm({ asset: initialAsset, getBalance })
  const [amount, asset] = form.watch(["amount", "asset"])
  const [debouncedAmount, isAmountSynced] = useDebouncedValue(amount)

  const isMint = asset.id === DOT_ASSET_ID
  const canQuote =
    Big(debouncedAmount || "0").gt(0) &&
    validateMaxBalance(getBalance(asset), debouncedAmount)

  const assetCap = getAssetCapData(userReserve.reserve)
  const supplyCapWarning = assetCap.supplyCap.determineWarningDisplay({
    supplyCap: assetCap.supplyCap,
  })
  const isBlockedSupply = !!supplyCapWarning

  const {
    data: mintQuote,
    error: mintError,
    isFetching: isMintFetching,
  } = useQuery(
    vdotMintSupplyQuery(rpc, {
      address,
      amount:
        isMint && canQuote && !isBlockedSupply
          ? toBigInt(debouncedAmount, asset.decimals)
          : 0n,
    }),
  )

  const { data: trade, isFetching: isTradeFetching } = useQuery(
    bestSellWithTxQuery(rpc, {
      assetIn: vdot.id,
      assetOut: aToken.id,
      amountIn: !isMint && canQuote && !isBlockedSupply ? debouncedAmount : "0",
      slippage: swapSlippage,
      address,
    }),
  )

  const quote = !isAmountSynced
    ? undefined
    : isMint
      ? mintQuote && {
          tx: mintQuote.get(),
          supplied: mintQuote.plan.supplyAmount,
        }
      : trade?.tx && {
          tx: trade.tx,
          supplied: toBigInt(debouncedAmount, vdot.decimals),
        }

  const isQuoteLoading =
    !isAmountSynced || (isMint ? isMintFetching : isTradeFetching)
  const suppliedHuman = quote ? scaleHuman(quote.supplied, vdot.decimals) : "0"

  const routeFees = mintQuote
    ? scaleHuman(
        mintQuote.plan.budgets.hydration +
          mintQuote.plan.budgets.assetHub +
          mintQuote.plan.budgets.bifrost,
        asset.decimals,
      )
    : undefined

  const mintErrorMessage =
    isMint && mintError && isAmountSynced
      ? mintError.message.startsWith(VDOT_MINT_TOO_SMALL_ERROR)
        ? t("borrow:supply.vdot.error.amountTooSmall")
        : t("borrow:supply.vdot.error.quote")
      : undefined

  // The quote's own tx prices the fee, so the fee-aware max only exists once quoted
  const { getMaxBalance } = useFormMaxBalanceWithFee(quote?.tx ?? null)
  const maxBalance = quote
    ? Big.min(getMaxBalance(asset), getBalance(asset)).toString()
    : getBalance(asset)
  const isFeeShortfall = !!quote && !validateMaxBalance(maxBalance, amount)

  const { data: healthFactor, isPlaceholderData: isHealthFactorStale } =
    useQuery(
      healthFactorQuery(rpc, {
        address,
        fromAsset: asset,
        fromAmount: debouncedAmount,
        toAsset: aToken,
        toAmount: suppliedHuman,
      }),
    )

  const { data: assetsApy } = useBorrowAssetsApy([vdot.id])
  const apys =
    first(assetsApy)?.underlyingAssetsApyData.map((apyData) => ({
      apy: apyData.supplyApy,
      apyType: apyData.apyType,
    })) ?? []

  const collateralType = getAssetCollateralType(
    userReserve,
    userBorrowData.totalCollateralUSD,
    userBorrowData.isInIsolationMode,
    assetCap.debtCeiling.isMaxed,
  )

  const supplyToasts = useProtocolActionToasts(ProtocolAction.supply, {
    value: t("currency", { value: suppliedHuman, symbol: vdot.symbol }),
  })
  const mintToasts = {
    submitted: t("borrow:supply.vdot.mintToasts.submitted", {
      value: t("currency", { value: amount, symbol: asset.symbol }),
    }),
    success: t("borrow:supply.vdot.mintToasts.success", {
      value: t("currency", { value: suppliedHuman, symbol: vdot.symbol }),
    }),
  }

  const onSubmit = async () => {
    if (!quote) throw new Error("vDOT supply not quoted")

    await createTransaction(
      { tx: quote.tx, toasts: isMint ? mintToasts : supplyToasts },
      {
        onSubmitted,
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: queryKeysFactory.pool })
          queryClient.invalidateQueries({
            queryKey: userBorrowSummaryQueryKey(
              safeConvertAnyToH160(address),
              lendingPoolAddressProvider,
            ),
          })
        },
      },
    )
  }

  return {
    form,
    isMint,
    maxBalance,
    onSubmit,
    apys,
    collateralType,
    healthFactor,
    isHealthFactorLoading:
      !isBlockedSupply && (isQuoteLoading || isHealthFactorStale),
    supplyCapWarning,
    isBlockedSupply,
    isQuoteLoading,
    isQuoted: !!quote,
    suppliedHuman,
    routeFees,
    mintErrorMessage,
    isFeeShortfall,
  }
}

const useSupplyVdotForm = ({
  asset,
  getBalance,
}: {
  asset: TAssetData
  getBalance: (asset: TAssetData) => string
}) =>
  useForm<SupplyVdotFormValues>({
    mode: "onChange",
    defaultValues: { amount: "", asset },
    resolver: standardSchemaResolver(
      z
        .object({
          amount: z.string(),
          asset: z.custom<TAssetData>(),
        })
        .refine(
          (form) => validateMaxBalance(getBalance(form.asset), form.amount),
          { error: maxBalanceError, path: ["amount"] },
        ),
    ),
  })
