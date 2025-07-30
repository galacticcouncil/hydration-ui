import {
  calculate_amplification,
  calculate_shares,
} from "@galacticcouncil/math-stableswap"
import { StableMath, Trade } from "@galacticcouncil/sdk"
import { useBestNumber } from "api/chain"
import { useStableswapPool } from "api/stableswap"
import { useTotalIssuances } from "api/totalIssuance"
import { scale } from "utils/balance"
import {
  AAVE_EXTRA_GAS,
  BN_0,
  BN_MILL,
  STABLEPOOL_TOKEN_DECIMALS,
} from "utils/constants"
import BigNumber from "bignumber.js"
import { scaleHuman } from "utils/balance"
import { z, ZodTypeAny } from "zod"
import { TAsset, TErc20, useAssets } from "providers/assets"
import i18n from "i18n/i18n"
import { TStablepool } from "sections/pools/PoolsPage.utils"
import { useTranslation } from "react-i18next"
import { useRpcProvider } from "providers/rpcProvider"
import { useStore } from "state/store"
import { useRefetchAccountAssets } from "api/deposits"
import { useLiquidityLimit } from "state/liquidityLimit"
import { calculateLimitShares } from "sections/pools/modals/AddLiquidity/AddLiquidity.utils"
import { useEstimatedFees } from "api/transaction"
import { createToastMessages } from "state/toasts"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  FieldErrors,
  SubmitHandler,
  useForm,
  UseFormReturn,
  useWatch,
} from "react-hook-form"
import { useBestTradeSell, useBestTradeSellTx } from "api/trade"
import { StepProps } from "components/Stepper/Stepper"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { TradeConfigCursor } from "@galacticcouncil/apps"
import { t } from "i18next"
import { useCallback, useEffect } from "react"
import { SubmittableExtrinsic } from "@polkadot/api/promise/types"
import { useDebouncedValue } from "hooks/useDebouncedValue"
import { useHealthFactorChange } from "api/borrow"
import { ProtocolAction } from "@aave/contract-helpers"

export type TStablepoolFormValue = {
  assetId: string
  amount: string
  decimals: number
}
export type TTransferableBalance = {
  assetId: string
  balance: string
  decimals: number
}

export type TAddStablepoolFormValues = {
  reserves: Array<TStablepoolFormValue>
  amount: string
  stablepoolShares: string
  farms: boolean
}

export type AddStablepoolWrapperProps = {
  asset: TAsset
  onClose: () => void
  onAssetOpen: () => void
  isStablepoolOnly: boolean
  isJoinFarms: boolean
  setIsJoinFarms: (value: boolean) => void
  initialAmount?: string
  setLiquidityLimit: () => void
  relatedAToken?: TErc20
  pool: TStablepool
  split: boolean
}

export type AddStablepoolProps = AddStablepoolWrapperProps & {
  transferableBalances: TTransferableBalance[]
  initialAmounts: { assetId: string; decimals: number; amount: string }[]
}

export type AddMoneyMarketStablepoolProps = AddStablepoolProps & {
  relatedAToken: TErc20
}

export const stablepoolZodSchema = (balances: TTransferableBalance[]) =>
  z.object({
    reserves: getReservesZodSchema(balances),
    amount: z.string(),
    stablepoolShares: z.string(),
  })

export const getReservesZodSchema = (balances: TTransferableBalance[]) => {
  const valueItemSchema = z.object({
    amount: z.string(),
    decimals: z.number(),
    assetId: z.string(),
  })

  const schema = z.array(valueItemSchema).superRefine((data, ctx) => {
    data.forEach((item, index) => {
      const maxBalance = balances.find(
        ({ assetId }) => assetId === item.assetId,
      )

      const maxbalanceShifted = maxBalance
        ? scaleHuman(maxBalance.balance, maxBalance.decimals)
        : "0"

      if (BigNumber(item.amount).gt(maxbalanceShifted)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: i18n.t("error.maxBalance"),
          path: [index],
        })
      }
    })
  })

  return schema
}

export const useStablepoolShares = (
  { poolId, reserves }: TStablepool,
  form: UseFormReturn<TAddStablepoolFormValues, any, undefined>,
) => {
  const { getAssetWithFallback } = useAssets()

  const { data: stableswapPool } = useStableswapPool(poolId)
  const { data: bestNumber } = useBestNumber()
  const { data: issuances } = useTotalIssuances()

  const { control, setValue, trigger, watch } = form

  const formValues = useWatch({ name: "reserves", control })

  const currentBlock = bestNumber?.relaychainBlockNumber.toString()
  const shareIssuance = issuances?.get(poolId)?.toString()

  const stablepoolShares = watch("amount") || "0"

  const getShares = useCallback(
    (assets: TStablepoolFormValue[]) => {
      if (!stableswapPool || !currentBlock || !shareIssuance) {
        return undefined
      }

      const amplification = calculate_amplification(
        stableswapPool.initialAmplification.toString(),
        stableswapPool.finalAmplification.toString(),
        stableswapPool.initialBlock.toString(),
        stableswapPool.finalBlock.toString(),
        currentBlock,
      )

      const validAssets = assets
        .filter(({ amount }) => BigNumber(amount).isPositive())
        .map(({ assetId, amount }) => ({
          asset_id: Number(assetId),
          amount: scale(
            amount,
            getAssetWithFallback(assetId).decimals,
          ).toString(),
        }))

      const pegs = StableMath.defaultPegs(stableswapPool.assets.length)

      const shares = calculate_shares(
        JSON.stringify(reserves),
        JSON.stringify(validAssets),
        amplification,
        shareIssuance,
        new BigNumber(stableswapPool.fee.toString()).div(BN_MILL).toString(),
        JSON.stringify(pegs),
      )

      return BigNumber.maximum(
        scaleHuman(shares, STABLEPOOL_TOKEN_DECIMALS),
        BN_0,
      ).toString()
    },
    [
      currentBlock,
      getAssetWithFallback,
      reserves,
      shareIssuance,
      stableswapPool,
    ],
  )

  useEffect(() => {
    const newStablepoolShares = getShares(formValues)

    if (
      newStablepoolShares &&
      !BigNumber(newStablepoolShares).eq(stablepoolShares)
    ) {
      setValue("amount", newStablepoolShares)
      trigger()
    }
  }, [formValues, stablepoolShares, getShares, setValue, trigger])

  return stablepoolShares
}

export const useStablepoolTradeShares = (
  asset: TAsset,
  relatedAToken: TErc20,
  form: UseFormReturn<TAddStablepoolFormValues, any, undefined>,
) => {
  const { control, setValue, trigger } = form

  const formValues = useWatch({ name: "reserves", control })
  const [debouncedValue = "0"] = useDebouncedValue(formValues[0].amount, 300)

  const { getSwapTx, tradeData } = useBestTradeSell(
    asset.id,
    relatedAToken.id,
    debouncedValue,
    (minAmount) => {
      setValue(
        "amount",
        scaleHuman(minAmount, STABLEPOOL_TOKEN_DECIMALS).toString(),
      )
      trigger()
    },
  )

  const hfChange = useHealthFactorChange({
    assetId: asset.id,
    amount: debouncedValue,
    action: ProtocolAction.withdraw,
  })

  return { getSwapTx, tradeData, hfChange }
}

export const useMaxBalances = (
  props: AddMoneyMarketStablepoolProps | AddStablepoolProps,
  tx: SubmittableExtrinsic,
) => {
  const estimatedFees = useEstimatedFees(tx)

  return props.transferableBalances.map(({ assetId, decimals, balance }) => {
    const isFeePaymentAsset = estimatedFees.accountCurrencyId === assetId

    if (isFeePaymentAsset) {
      return {
        assetId,
        decimals,
        balance: BigNumber(balance)
          .minus(estimatedFees.accountCurrencyFee)
          .minus(props.asset.existentialDeposit)
          .toString(),
      }
    }

    return {
      assetId,
      decimals,
      balance: BigNumber(balance).toString(),
    }
  })
}

export const useMoneyMarketStablepoolExtimationTx = (
  props: AddMoneyMarketStablepoolProps,
) => {
  const { api } = useRpcProvider()

  const {
    initialAmounts,
    pool: { poolId },
  } = props

  const amounts = initialAmounts.map(({ assetId }) => ({
    assetId,
    amount: "1",
  }))

  const { data: tradeTx } = useBestTradeSellTx(poolId, "0", "1")

  return tradeTx ?? api.tx.stableswap.addAssetsLiquidity(poolId, amounts, "1")
}

export const useMoneyMarketSplitStablepoolExtimationTx = (
  props: AddMoneyMarketStablepoolProps,
) => {
  const { api } = useRpcProvider()

  const {
    initialAmounts,
    pool: { poolId },
  } = props

  const amounts = initialAmounts.map(({ assetId }) => ({
    assetId,
    amount: "1",
  }))

  const { data: tradeTx } = useBestTradeSellTx(poolId, "0", "1")

  return tradeTx
    ? api.tx.utility.batchAll([
        api.tx.stableswap.addAssetsLiquidity(poolId, amounts, "1"),
        tradeTx,
      ])
    : api.tx.stableswap.addAssetsLiquidity(poolId, amounts, "1")
}

export const useStablepoolExtimationTx = (props: AddStablepoolProps) => {
  const { api } = useRpcProvider()

  const {
    isJoinFarms,
    isStablepoolOnly,
    initialAmounts,
    pool: { poolId, farms },
  } = props

  const amounts = initialAmounts.map(({ assetId }) => ({
    assetId,
    amount: "1",
  }))

  return isStablepoolOnly
    ? api.tx.stableswap.addAssetsLiquidity(poolId, amounts, "1")
    : api.tx.omnipoolLiquidityMining.addLiquidityStableswapOmnipoolAndJoinFarms(
        poolId,
        amounts,
        isJoinFarms
          ? farms.map<[string, string]>((farm) => [
              farm.globalFarmId,
              farm.yieldFarmId,
            ])
          : null,
      )
}

export const useStablepoolSubmitHandler = (props: AddStablepoolProps) => {
  const { api } = useRpcProvider()
  const { createTransaction } = useStore()
  const { getAssetWithFallback } = useAssets()
  const refetchPositions = useRefetchAccountAssets()
  const { addLiquidityLimit } = useLiquidityLimit()

  const {
    isJoinFarms,
    isStablepoolOnly,
    pool: { poolId, farms },
    onClose,
  } = props

  const onSubmit = async (values: TAddStablepoolFormValues) => {
    const shiftedShares = scale(
      values.amount,
      STABLEPOOL_TOKEN_DECIMALS,
    ).toString()
    const limitShares = calculateLimitShares(shiftedShares, addLiquidityLimit)

    const assets = values.reserves
      .filter(({ amount }) => BigNumber(amount).isPositive())
      .map((v) => ({
        assetId: v.assetId,
        amount: scale(v.amount, v.decimals).toString(),
      }))

    const tx = isStablepoolOnly
      ? api.tx.stableswap.addAssetsLiquidity(poolId, assets, limitShares)
      : api.tx.omnipoolLiquidityMining.addLiquidityStableswapOmnipoolAndJoinFarms(
          poolId,
          assets,
          isJoinFarms
            ? farms.map<[string, string]>((farm) => [
                farm.globalFarmId,
                farm.yieldFarmId,
              ])
            : null,
        )

    await createTransaction(
      {
        tx,
      },
      {
        onSuccess: refetchPositions,
        onSubmitted: onClose,
        onError: onClose,
        onClose,
        onBack: () => {},
        toast: addStablepoolToast(values.reserves, getAssetWithFallback),
      },
    )
  }

  return { onSubmit }
}

export const useSplitMoneyMarketStablepoolSubmitHandler = (
  props: AddMoneyMarketStablepoolProps,
) => {
  const { t } = useTranslation()
  const { api, sdk } = useRpcProvider()
  const { createTransaction } = useStore()
  const { account } = useAccount()
  const { getAssetWithFallback } = useAssets()
  const refetchPositions = useRefetchAccountAssets()
  const { addLiquidityLimit } = useLiquidityLimit()

  const {
    isJoinFarms,
    isStablepoolOnly,
    relatedAToken,
    pool: { poolId, farms, balance },
    onClose,
  } = props

  const onSubmit = async (values: TAddStablepoolFormValues) => {
    const getStepper = (activeIndex: number): StepProps[] => {
      const labels = [
        t("liquidity.add.modal.proportionally.stepper.addLiquidity"),
        t("liquidity.add.modal.proportionally.stepper.get", {
          symbol: relatedAToken.symbol,
        }),
      ]

      return labels.map((label, index) => ({
        label,
        state:
          index === activeIndex
            ? "active"
            : index < activeIndex
              ? "done"
              : "todo",
      }))
    }

    const initialBalance = balance?.transferable ?? "0"

    const shiftedShares = scale(
      values.amount,
      STABLEPOOL_TOKEN_DECIMALS,
    ).toString()

    const limitShares = calculateLimitShares(shiftedShares, addLiquidityLimit)

    const assetsToAdd = values.reserves.filter(({ amount }) =>
      BigNumber(amount).isPositive(),
    )

    const stableswapTx = api.tx.stableswap.addAssetsLiquidity(
      poolId,
      assetsToAdd.map((v) => ({
        assetId: v.assetId,
        amount: scale(v.amount, v.decimals).toString(),
      })),
      limitShares,
    )

    const toastValue = assetsToAdd
      .map(
        ({ assetId, amount }) =>
          `${amount} ${getAssetWithFallback(assetId).symbol}`,
      )
      .join(", ")

    await createTransaction(
      {
        tx: stableswapTx,
      },
      {
        onSuccess: refetchPositions,
        onSubmitted: onClose,
        onError: onClose,
        onClose,
        onBack: () => {},
        steps: getStepper(0),
        toast: addStablepoolToast(values.reserves, getAssetWithFallback),
        disableAutoClose: true,
      },
    )

    const allShares = (
      await sdk.client.balance.getBalance(account?.address ?? "", poolId)
    ).toString()

    const newAddedShares = BigNumber(allShares).minus(initialBalance).toString()
    const newAddedSharesShifted = scaleHuman(
      newAddedShares,
      STABLEPOOL_TOKEN_DECIMALS,
    ).toString()

    const slippageData = TradeConfigCursor.deref().slippage

    const builtTx = await sdk.tx
      .trade(
        await sdk.api.router.getBestSell(
          poolId,
          relatedAToken.id,
          newAddedSharesShifted,
        ),
      )
      .withSlippage(Number(slippageData))
      .withBeneficiary(account?.address ?? "")
      .build()

    const omnipoolLimitShares = calculateLimitShares(
      newAddedShares,
      addLiquidityLimit,
    )

    const swapTx = await api.tx(builtTx.hex)
    const addOmnipoolTx = api.tx.dispatcher.dispatchWithExtraGas(
      isJoinFarms
        ? api.tx.omnipoolLiquidityMining.addLiquidityAndJoinFarms(
            farms.map<[string, string]>((farm) => [
              farm.globalFarmId,
              farm.yieldFarmId,
            ]),
            relatedAToken.id,
            newAddedShares,
            omnipoolLimitShares,
          )
        : api.tx.omnipool.addLiquidityWithLimit(
            relatedAToken.id,
            newAddedShares,
            omnipoolLimitShares,
          ),
      AAVE_EXTRA_GAS,
    )

    const tx = isStablepoolOnly
      ? swapTx
      : api.tx.utility.batchAll([swapTx, addOmnipoolTx])

    await createTransaction(
      {
        tx,
      },
      {
        onSuccess: refetchPositions,
        onSubmitted: onClose,
        onError: onClose,
        onClose,
        onBack: () => {},
        steps: getStepper(1),
        toast: createToastMessages("liquidity.add.modal.proportionally.toast", {
          t,
          tOptions: {
            value: toastValue,
          },
          components: ["span", "span.highlight"],
        }),
      },
    )
  }

  return { onSubmit }
}

export const useMoneyMarketStablepoolSubmit = (
  props: AddMoneyMarketStablepoolProps,
  trade: Trade | undefined,
) => {
  const { t } = useTranslation()
  const { api, sdk } = useRpcProvider()
  const { createTransaction } = useStore()
  const { account } = useAccount()
  const { getAssetWithFallback } = useAssets()
  const refetchPositions = useRefetchAccountAssets()
  const { addLiquidityLimit } = useLiquidityLimit()

  const {
    isJoinFarms,
    isStablepoolOnly,
    relatedAToken,
    pool: { farms, aBalance },
    onClose,
  } = props

  const getStepper = (activeIndex: number): StepProps[] => {
    const labels = [
      t("liquidity.add.modal.geth.stepper.first"),
      t(
        `liquidity.add.modal.geth.stepper.second${isJoinFarms ? ".joinFarms" : ""}`,
      ),
    ]

    return labels.map((label, index) => ({
      label,
      state:
        index === activeIndex
          ? "active"
          : index < activeIndex
            ? "done"
            : "todo",
    }))
  }

  const onJoinOmnipool = async () => {
    const initialBalance = aBalance?.transferable ?? "0"

    const allShares = (
      await sdk.client.balance.getBalance(
        account?.address ?? "",
        relatedAToken.id,
      )
    ).toString()

    const diffBalance = BigNumber(allShares).minus(initialBalance).toString()

    const limitShares = calculateLimitShares(diffBalance, addLiquidityLimit)

    const tx = api.tx.dispatcher.dispatchWithExtraGas(
      isJoinFarms
        ? api.tx.omnipoolLiquidityMining.addLiquidityAndJoinFarms(
            farms.map<[string, string]>((farm) => [
              farm.globalFarmId,
              farm.yieldFarmId,
            ]),
            relatedAToken.id,
            diffBalance,
            limitShares,
          )
        : api.tx.omnipool.addLiquidityWithLimit(
            relatedAToken.id,
            diffBalance,
            limitShares,
          ),
      AAVE_EXTRA_GAS,
    )

    const toast = createToastMessages(
      `liquidity.add.modal.${isJoinFarms ? "andJoinFarms." : ""}toast`,
      {
        t,
        tOptions: {
          value: scaleHuman(diffBalance, relatedAToken.decimals),
          symbol: relatedAToken.symbol,
          where: "Omnipool",
        },
        components: ["span", "span.highlight"],
      },
    )

    await createTransaction(
      {
        tx,
      },
      {
        onSuccess: refetchPositions,
        onSubmitted: onClose,
        onError: onClose,
        onClose,
        onBack: () => {},
        toast,
        steps: getStepper(1),
      },
    )
  }

  const onSubmit = async (values: TAddStablepoolFormValues) => {
    if (!account || !trade) throw new Error("Account is not found")

    const slippageData = TradeConfigCursor.deref().slippage
    const { tx: sdkTx } = sdk

    const builtTx = await sdkTx
      .trade(trade)
      .withSlippage(Number(slippageData))
      .withBeneficiary(account.address)
      .build()

    const tx = await api.tx(builtTx.hex)

    await createTransaction(
      {
        tx,
      },
      {
        onSuccess: refetchPositions,
        onSubmitted: onClose,
        onError: onClose,
        onClose,
        onBack: () => {},
        toast: addStablepoolToast(values.reserves, getAssetWithFallback),
        disableAutoClose: !isStablepoolOnly,
        steps: !isStablepoolOnly ? getStepper(0) : undefined,
      },
    )

    if (isStablepoolOnly) return

    await onJoinOmnipool()
  }

  return { onSubmit }
}

export const useAddStablepoolForm = (
  props: AddStablepoolProps,
  resolver?: ZodTypeAny,
) => {
  const {
    initialAmounts,
    isJoinFarms,
    pool: { farms },
  } = props

  const form = useForm<TAddStablepoolFormValues>({
    mode: "onChange",
    defaultValues: {
      reserves: initialAmounts,
      stablepoolShares: "",
      amount: "",
      farms: !!farms.length,
    },
    resolver: resolver ? zodResolver(resolver) : undefined,
  })

  const onInvalidSubmit = (
    errors: FieldErrors<TAddStablepoolFormValues>,
    onSubmit: SubmitHandler<TAddStablepoolFormValues>,
  ) => {
    const { farms, ...blockingErrors } = errors

    if (!isJoinFarms && !Object.keys(blockingErrors).length) {
      onSubmit(form.getValues())
    }
  }

  const handleSubmit = (onSubmit: SubmitHandler<TAddStablepoolFormValues>) =>
    form.handleSubmit(onSubmit, (e) => onInvalidSubmit(e, onSubmit))

  return { form, handleSubmit }
}

export const addStablepoolToast = (
  reserves: TStablepoolFormValue[],
  getAssetMeta: (id: string) => TAsset,
) => {
  const assetsToAdd = reserves.filter(({ amount }) =>
    BigNumber(amount).isPositive(),
  )

  const toastValue = assetsToAdd
    .map(({ assetId, amount }) => `${amount} ${getAssetMeta(assetId).symbol}`)
    .join(", ")

  return createToastMessages("liquidity.add.modal.toast", {
    t,
    tOptions: {
      value: toastValue,
      where: "Stablepool",
    },
    components: ["span", "span.highlight"],
  })
}
