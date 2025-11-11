import { useAccount } from "@galacticcouncil/web3-connect"
import { useMutation, useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useDebounce } from "use-debounce"

import { healthFactorQuery } from "@/api/aave"
import { TAssetData } from "@/api/assets"
import { useOmnipoolFarms } from "@/api/farms"
import { StableSwapBase } from "@/api/pools"
import { bestSellQuery } from "@/api/trade"
import {
  getStablepoolShares,
  useStablepoolAddLiquidityForm,
} from "@/modules/liquidity/components/AddStablepoolLiquidity/AddStablepoolLiquidity.utils"
import { useMinimumTradeAmount } from "@/modules/liquidity/components/RemoveLiquidity/RemoveMoneyMarketLiquidity.utils"
import { isValidStablepoolToken } from "@/modules/liquidity/Liquidity.utils"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAccountBalances } from "@/states/account"
import { useTradeSettings } from "@/states/tradeSettings"
import {
  isSubstrateTxResult,
  useTransactionsStore,
} from "@/states/transactions"
import { scale, scaleHuman } from "@/utils/formatting"

export type TReserveFormValue = {
  asset: TAssetData
  amount: string
}

export type TAddStablepoolLiquidityFormValues = {
  reserves: Array<TReserveFormValue>
  sharesAmount: string
  option: "omnipool" | "stablepool"
  split: boolean
  selectedAssetId: string
}

export const useAddMoneyMarketLiquidity = ({
  pool,
  erc20Id,
  onSubmitted,
}: {
  pool: StableSwapBase
  erc20Id: string
  onSubmitted: () => void
}) => {
  const { t } = useTranslation(["liquidity", "common"])
  const { getAssetWithFallback } = useAssets()
  const rpc = useRpcProvider()
  const { account } = useAccount()
  const createTransaction = useTransactionsStore((s) => s.createTransaction)
  const { getTransferableBalance } = useAccountBalances()
  const { data: omnipoolFarms } = useOmnipoolFarms()
  const {
    liquidity: { slippage },
    swap: {
      single: { swapSlippage },
    },
  } = useTradeSettings()

  const { papi, sdk } = rpc
  const poolId = pool.id.toString()
  const activeFarms =
    omnipoolFarms?.[poolId]?.filter((farm) => farm.apr !== "0") ?? []
  const isFarms = activeFarms.length > 0

  const stablepoolAssets = pool.tokens
    .filter(isValidStablepoolToken)
    .map((asset) => ({
      asset: getAssetWithFallback(asset.id),
      balance: asset.balance,
    }))
  const meta = getAssetWithFallback(pool.id)

  const accountReserveBalances = new Map(
    stablepoolAssets.map(({ asset }) => [
      asset.id,
      scaleHuman(getTransferableBalance(asset.id), asset.decimals),
    ]),
  )

  const form = useStablepoolAddLiquidityForm({
    poolId,
    selectedAssetId: stablepoolAssets[0]!.asset.id,
    reserves: stablepoolAssets.map(({ asset }) => ({
      asset,
      amount: "",
    })),
    accountReserveBalances,
    option: "stablepool",
  })

  const [reserves, split, selectedAssetId] = form.watch([
    "reserves",
    "split",
    "selectedAssetId",
  ])

  const assetsToProvide = split
    ? reserves.filter(({ amount }) => Big(amount || "0").gt(0))
    : reserves.filter(
        ({ amount, asset }) =>
          Big(amount || "0").gt(0) && asset.id === selectedAssetId,
      )

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

  const assetIn = split ? poolId : (tradeFormAsset?.asset.id ?? "")
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

  //console.log({ minReceiveAmount, minStablepoolShares, tradeAmountIn })
  //   const minJoinAmount = useMinOmnipoolFarmJoin(activeFarms, meta) || "0"
  //   const isCheckJoinFarms =
  //     isFarms && Big(stablepoolSharesHuman).gt(0) && option === "omnipool"

  //   const joinFarmErrorMessage =
  //     isCheckJoinFarms && Big(stablepoolSharesHuman).lte(minJoinAmount)
  //       ? t("liquidity.joinFarms.modal.validation.minShares", {
  //           value: minJoinAmount,
  //           symbol: meta.symbol,
  //         })
  //       : undefined

  //   const isJoinFarms = isCheckJoinFarms && !joinFarmErrorMessage

  const joinFarmErrorMessage = undefined
  const isJoinFarms = false

  useEffect(() => {
    form.setValue("sharesAmount", stablepoolSharesHuman, {
      shouldValidate: true,
    })
  }, [form, stablepoolSharesHuman])

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
          Number(poolId),
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
          { onSubmitted },
        )
      }
    },
  })

  return {
    form,
    accountReserveBalances,
    //@TODO: add assets to select for non split mode
    assetsToSelect: split ? [] : [],
    stablepoolSharesHuman,
    meta,
    mutation,
    activeFarms,
    isFarms,
    joinFarmErrorMessage,
    isJoinFarms,
    minReceiveAmount,
    healthFactor,
  }
}
