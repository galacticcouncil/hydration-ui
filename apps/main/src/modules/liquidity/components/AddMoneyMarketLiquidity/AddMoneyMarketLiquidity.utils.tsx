import { GETH_ERC20_ID } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useMutation, useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useEffect, useMemo } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useDebounce } from "use-debounce"

import { healthFactorAfterWithdrawQuery, healthFactorQuery } from "@/api/aave"
import { TAssetData } from "@/api/assets"
import { useOmnipoolFarms } from "@/api/farms"
import { bestSellQuery } from "@/api/trade"
import { useLiquidityOmnipoolShares } from "@/modules/liquidity/components/AddLiquidity/AddLiqudity.utils"
import { AddMoneyMarketLiquidityWrapperProps } from "@/modules/liquidity/components/AddStablepoolLiquidity/AddStablepoolLiquidity"
import {
  getStablepoolShares,
  TAddStablepoolLiquidityFormValues,
  useAssetsToAddToMoneyMarket,
  useStablepoolAddLiquidityForm,
} from "@/modules/liquidity/components/AddStablepoolLiquidity/AddStablepoolLiquidity.utils"
import { useMinOmnipoolFarmJoin } from "@/modules/liquidity/components/JoinFarms/JoinFarms.utils"
import { useMinimumTradeAmount } from "@/modules/liquidity/components/RemoveLiquidity/RemoveMoneyMarketLiquidity.utils"
import { TStablepoolDetails } from "@/modules/liquidity/Liquidity.utils"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAccountBalances } from "@/states/account"
import { useTradeSettings } from "@/states/tradeSettings"
import {
  isSubstrateTxResult,
  useTransactionsStore,
} from "@/states/transactions"
import { scale, scaleHuman } from "@/utils/formatting"

export type TAddMoneyMarketLiquidityWrapperReturn = Omit<
  ReturnType<typeof useAddMoneyMarketLiquidityWrapper>,
  "form"
>

export const useAddMoneyMarketLiquidityWrapper = ({
  stablepoolDetails: { reserves },
  stableswapId,
  erc20Id,
}: {
  stablepoolDetails: TStablepoolDetails
  stableswapId: string
  erc20Id: string
}) => {
  const { getAssetWithFallback } = useAssets()
  const { balances } = useAccountBalances()

  const { stablepoolAssets, reserveIds } = useMemo(() => {
    const stablepoolAssets: { asset: TAssetData; balance: string }[] = []
    const reserveIds: string[] = []

    for (const reserve of reserves) {
      stablepoolAssets.push({
        asset: reserve.meta,
        balance: reserve.amount,
      })
      reserveIds.push(reserve.asset_id.toString())
    }

    return { stablepoolAssets, reserveIds }
  }, [reserves])

  const accountBalances = new Map(
    Object.values(balances).map((balance) => [
      balance.assetId,
      scaleHuman(
        balance.transferable,
        getAssetWithFallback(balance.assetId).decimals,
      ),
    ]),
  )

  const isGETHPool = erc20Id === GETH_ERC20_ID
  const assetsToSelect = useAssetsToAddToMoneyMarket({
    stableswapId,
    reserves,
    options: {
      blacklist: !isGETHPool ? [erc20Id] : [],
    },
  })
  const initialAssetIdToAdd = assetsToSelect[0]?.id

  const form = useStablepoolAddLiquidityForm({
    poolId: stableswapId,
    selectedAssetId: initialAssetIdToAdd ?? "",
    accountBalances,
    option: "stablepool",
    activeFieldIds: reserveIds,
  })

  const [split, selectedAssetId, activeFields] = form.watch([
    "split",
    "selectedAssetId",
    "activeFields",
  ])
  const isGETHProviding =
    isGETHPool && !split && selectedAssetId === GETH_ERC20_ID
  const meta = getAssetWithFallback(isGETHProviding ? erc20Id : stableswapId)

  const assetsToProvide = activeFields
    .filter(({ amount }) => Big(amount || "0").gt(0))
    .map(({ assetId, amount }) => ({
      asset: getAssetWithFallback(assetId),
      amount,
    }))

  useEffect(() => {
    if (!selectedAssetId && initialAssetIdToAdd) {
      form.setValue("selectedAssetId", initialAssetIdToAdd, {
        shouldValidate: true,
      })
    }
  }, [form, initialAssetIdToAdd, selectedAssetId])

  useEffect(() => {
    form.setValue("option", isGETHProviding ? "omnipool" : "stablepool")
  }, [form, isGETHProviding])

  return {
    form,
    accountBalances,
    assetsToSelect: split ? [] : assetsToSelect,
    meta,
    reserveIds,
    displayOption: false,
    assetsToProvide,
    isGETHProviding,
    stablepoolAssets,
    erc20Id,
  }
}

export const useAddGETHToOmnipool = ({
  formData,
  props,
}: {
  formData: TAddMoneyMarketLiquidityWrapperReturn
  props: AddMoneyMarketLiquidityWrapperProps
}) => {
  const { t } = useTranslation(["liquidity", "common"])
  const { getAssetWithFallback } = useAssets()
  const rpc = useRpcProvider()
  const { account } = useAccount()
  const createTransaction = useTransactionsStore((s) => s.createTransaction)
  const { data: omnipoolFarms } = useOmnipoolFarms()
  const { erc20Id, assetsToProvide } = formData
  const meta = getAssetWithFallback(erc20Id)

  const activeFarms =
    omnipoolFarms?.[erc20Id]?.filter((farm) => farm.apr !== "0") ?? []
  const amountToProvide = assetsToProvide[0]?.amount || "0"

  const minJoinAmount = useMinOmnipoolFarmJoin(activeFarms, meta) || "0"

  const isCheckJoinFarms = activeFarms.length > 0 && Big(amountToProvide).gt(0)

  const joinFarmErrorMessage =
    isCheckJoinFarms && Big(amountToProvide).lte(minJoinAmount)
      ? t("liquidity.joinFarms.modal.validation.minShares", {
          value: minJoinAmount,
          symbol: getAssetWithFallback(erc20Id).symbol,
        })
      : undefined

  const isJoinFarms = isCheckJoinFarms && !joinFarmErrorMessage

  const omnipoolShares = useLiquidityOmnipoolShares(amountToProvide, erc20Id)
  const minSharesToGet = omnipoolShares?.minSharesToGet ?? "0"
  const minReceiveAmount = scaleHuman(minSharesToGet, meta.decimals)

  const [debouncedAmount] = useDebounce(amountToProvide, 300)

  const { data: healthFactor } = useQuery(
    healthFactorAfterWithdrawQuery(rpc, {
      address: account?.address ?? "",
      fromAssetId: props.stableswapId,
      fromAmount: debouncedAmount,
    }),
  )

  const mutation = useMutation({
    mutationFn: async (): Promise<void> => {
      if (!minSharesToGet) throw new Error("minReceiveAmount is not found")

      const { papi } = rpc
      const amount = Big(scale(amountToProvide, meta.decimals)).toFixed(0)

      const tx = isJoinFarms
        ? papi.tx.OmnipoolLiquidityMining.add_liquidity_and_join_farms({
            asset: Number(erc20Id),
            amount: BigInt(amount),
            min_shares_limit: BigInt(minSharesToGet),
            farm_entries: activeFarms.map((farm) => [
              farm.globalFarmId,
              farm.yieldFarmId,
            ]),
          })
        : papi.tx.Omnipool.add_liquidity_with_limit({
            asset: Number(erc20Id),
            amount: BigInt(amount),
            min_shares_limit: BigInt(minSharesToGet),
          })

      const shiftedAmount = scaleHuman(amountToProvide, meta.decimals)
      const tOptions = {
        value: shiftedAmount,
        symbol: meta.symbol,
        where: "Omnipool",
      }

      await createTransaction(
        {
          tx,
          toasts: {
            submitted: t(
              isJoinFarms
                ? "liquidity.add.joinFarms.modal.toast.submitted"
                : "liquidity.add.modal.toast.submitted",
              tOptions,
            ),
            success: t(
              isJoinFarms
                ? "liquidity.add.joinFarms.modal.toast.success"
                : "liquidity.add.modal.toast.success",
              tOptions,
            ),
          },
        },
        { onSubmitted: props.onBack },
      )
    },
  })

  return {
    joinFarmErrorMessage,
    isJoinFarms,
    activeFarms,
    mutation,
    minReceiveAmount,
    healthFactor,
    ...formData,
  }
}

export const useAddMoneyMarketLiquidity = ({
  formData,
  props,
}: {
  formData: TAddMoneyMarketLiquidityWrapperReturn
  props: AddMoneyMarketLiquidityWrapperProps
}) => {
  const { t } = useTranslation(["liquidity", "common"])
  const { getAssetWithFallback } = useAssets()
  const rpc = useRpcProvider()
  const { account } = useAccount()
  const createTransaction = useTransactionsStore((s) => s.createTransaction)
  const { getTransferableBalance } = useAccountBalances()
  const {
    liquidity: { slippage },
    swap: {
      single: { swapSlippage },
    },
  } = useTradeSettings()
  const form = useFormContext<TAddStablepoolLiquidityFormValues>()

  const { papi, sdk } = rpc
  const { erc20Id, assetsToProvide, stablepoolAssets } = formData
  const {
    stableswapId,
    stablepoolDetails: { pool },
    onBack,
  } = props

  const meta = getAssetWithFallback(stableswapId)

  const [split] = form.watch(["split"])

  const stablepoolShares = getStablepoolShares(
    assetsToProvide,
    stablepoolAssets,
    pool,
  )

  const minStablepoolShares = Big(stablepoolShares)
    .times(100 - slippage)
    .div(100)
    .toFixed(0)

  const stablepoolSharesHuman =
    scaleHuman(minStablepoolShares, meta.decimals) || "0"

  const tradeFormAsset = assetsToProvide[0]

  const assetIn = split ? stableswapId : (tradeFormAsset?.asset.id ?? "")
  const amounIn = split
    ? stablepoolSharesHuman
    : (tradeFormAsset?.amount ?? "0")

  const [debouncedAmountIn] = useDebounce(amounIn, 300)
  const { data: trade } = useQuery(
    bestSellQuery(
      rpc,
      {
        assetIn,
        assetOut: erc20Id,
        amountIn: debouncedAmountIn,
        slippage: swapSlippage,
        address: account?.address ?? "",
      },
      true,
    ),
  )

  const minimumTradeAmount =
    useMinimumTradeAmount(trade?.swap)?.toString() ?? "0"
  const tradeAmountOut = split
    ? (trade?.swap.amountOut ?? "0")
    : minimumTradeAmount
  const minReceiveAmount = scaleHuman(tradeAmountOut, meta.decimals)

  //@TODO: decide how to display health factor when providing liquidity to shares and then trade to erc20
  const { data: healthFactor } = useQuery(
    healthFactorQuery(rpc, {
      address: account?.address ?? "",
      fromAsset: getAssetWithFallback(assetIn),
      fromAmount: debouncedAmountIn,
      toAsset: getAssetWithFallback(erc20Id),
      toAmount: minReceiveAmount,
    }),
  )

  const mutation = useMutation({
    mutationFn: async (): Promise<void> => {
      if (!account?.address) throw new Error("No account address")
      if (!assetsToProvide.length) throw new Error("No assets to provide")

      const assetsToProvideFormatted = assetsToProvide.map(
        ({ asset, amount }) => ({
          asset_id: Number(asset.id),
          amount: BigInt(scale(amount, asset.decimals)),
        }),
      )

      if (split) {
        const initialShares = getTransferableBalance(pool.id.toString())

        //first addding proportionally
        const firstTx = papi.tx.Stableswap.add_assets_liquidity({
          pool_id: pool.id,
          assets: assetsToProvideFormatted,
          min_shares: BigInt(minStablepoolShares),
        })

        const addingSharesResult = await createTransaction({
          tx: firstTx,
        })

        let addedShares = 0n

        if (isSubstrateTxResult(addingSharesResult)) {
          addedShares =
            papi.event.Stableswap.LiquidityAdded.filter(
              addingSharesResult.events,
            ).find((event) => event.who === account?.address)?.shares ?? 0n
        } else {
          const { client } = sdk
          const { balance } = client

          const shares = await balance.getBalance(
            account?.address ?? "",
            pool.id,
          )

          addedShares = shares.transferable - initialShares
        }

        const addedSharesShifted = scaleHuman(
          addedShares.toString(),
          meta.decimals,
        ).toString()

        //second swap stableswap shares for the current pool
        const swap = await sdk.api.router.getBestSell(
          Number(stableswapId),
          Number(erc20Id),
          addedSharesShifted,
        )

        const swapTx = await sdk.tx
          .trade(swap)
          .withSlippage(slippage)
          .withBeneficiary(account.address)
          .build()
          .then((tx) => tx.get())

        await createTransaction({
          tx: swapTx,
        })
      } else {
        if (!trade) throw new Error("Trade not found")

        const toastValue = assetsToProvide
          .map(({ asset, amount }) =>
            t("common:number", {
              value: amount,
              symbol: asset.symbol,
            }),
          )
          .join(", ")

        const tOptions = {
          value: toastValue,
          where: "Stablepool",
        }

        const toasts = {
          submitted: t("liquidity.add.modal.toast.submitted", tOptions),
          success: t("liquidity.add.modal.toast.success", tOptions),
        }

        await createTransaction(
          {
            tx: trade.tx,
            toasts,
          },
          { onSubmitted: onBack },
        )
      }
    },
  })

  return {
    mutation,
    activeFarms: [],
    joinFarmErrorMessage: undefined,
    isJoinFarms: false,
    minReceiveAmount,
    healthFactor: Big(debouncedAmountIn).gt(0) ? healthFactor : undefined,
    ...formData,
  }
}
