import { GETH_ERC20_ID } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useMutation, useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useEffect, useMemo } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { first } from "remeda"
import { useDebounce } from "use-debounce"

import { healthFactorAfterWithdrawQuery, healthFactorQuery } from "@/api/aave"
import { TAssetData } from "@/api/assets"
import { bestSellQuery } from "@/api/trade"
import {
  useCheckJoinOmnipoolFarm,
  useLiquidityOmnipoolShares,
} from "@/modules/liquidity/components/AddLiquidity/AddLiqudity.utils"
import { AddMoneyMarketLiquidityWrapperProps } from "@/modules/liquidity/components/AddStablepoolLiquidity/AddStablepoolLiquidity"
import {
  getStablepoolShares,
  TAddStablepoolLiquidityFormValues,
  useAssetsToAddToMoneyMarket,
  useStablepoolAddLiquidityForm,
} from "@/modules/liquidity/components/AddStablepoolLiquidity/AddStablepoolLiquidity.utils"
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
import { AAVE_EXTRA_GAS } from "@/utils/consts"
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
    isGETHPool,
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
  const { getAssetWithFallback, isErc20AToken } = useAssets()
  const rpc = useRpcProvider()
  const { account } = useAccount()
  const createTransaction = useTransactionsStore((s) => s.createTransaction)
  const {
    liquidity: { slippage },
    swap: {
      single: { swapSlippage },
    },
  } = useTradeSettings()
  const { erc20Id, assetsToProvide, stablepoolAssets, isGETHProviding } =
    formData
  const { pool } = props.stablepoolDetails
  const meta = getAssetWithFallback(erc20Id)
  const stableswapMeta = getAssetWithFallback(pool.id)
  const form = useFormContext<TAddStablepoolLiquidityFormValues>()
  const getMinimumTradeAmount = useMinimumTradeAmount()
  const getOmnipoolGetShares = useLiquidityOmnipoolShares(erc20Id)
  const { getTransferableBalance } = useAccountBalances()
  const [split, selectedAssetId] = form.watch(["split", "selectedAssetId"])

  const { assetIn, amounIn, minStablepoolShares } = (() => {
    if (split) {
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

      const assetIn = props.stableswapId
      const amounIn = stablepoolSharesHuman

      return {
        assetIn,
        amounIn,
        minStablepoolShares,
      }
    } else if (isGETHProviding) {
      return {
        assetIn: "",
        amounIn: assetsToProvide[0]?.amount || "0",
        minStablepoolShares: "0",
      }
    } else {
      const tradeFormAsset = assetsToProvide[0]

      const assetIn = tradeFormAsset?.asset.id ?? selectedAssetId
      const amounIn = tradeFormAsset?.amount ?? "0"

      return {
        assetIn,
        amounIn,
        minStablepoolShares: "0",
      }
    }
  })()

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

  const minGETHToGet = (() => {
    if (isGETHProviding) {
      return amounIn
    } else if (split) {
      // stablewap token is swapped 1:1 with erc20 token without slippage
      return scaleHuman(trade?.swap.amountOut ?? "0", meta.decimals)
    } else {
      return scaleHuman(
        getMinimumTradeAmount(trade?.swap)?.toString() ?? "0",
        meta.decimals,
      )
    }
  })()

  const { isJoinFarms, joinFarmErrorMessage, activeFarms } =
    useCheckJoinOmnipoolFarm({
      amount: minGETHToGet,
      meta,
    })

  const omnipoolShares = getOmnipoolGetShares(minGETHToGet)
  const minSharesToGet = omnipoolShares?.minSharesToGet ?? "0"
  const minReceiveAmount = scaleHuman(minSharesToGet, meta.decimals)
  const assetInMeta = getAssetWithFallback(assetIn)

  const { data: healthFactorQueryData } = useQuery(
    healthFactorAfterWithdrawQuery(rpc, {
      address: account?.address ?? "",
      fromAssetId: isErc20AToken(assetInMeta)
        ? assetInMeta.underlyingAssetId
        : "",
      fromAmount: debouncedAmountIn,
    }),
  )

  const healthFactor = isErc20AToken(assetInMeta)
    ? healthFactorQueryData
    : undefined

  const mutation = useMutation({
    mutationFn: async (): Promise<void> => {
      if (!minSharesToGet) throw new Error("minReceiveAmount is not found")
      if (!account?.address) throw new Error("No account address")

      const { papi, sdk } = rpc
      const tradeTx = trade?.tx

      if (isGETHProviding) {
        const amountToJoinOmnipool = Big(
          scale(minGETHToGet, meta.decimals),
        ).toFixed(0)

        const omnipoolTx = isJoinFarms
          ? papi.tx.OmnipoolLiquidityMining.add_liquidity_and_join_farms({
              asset: Number(erc20Id),
              amount: BigInt(amountToJoinOmnipool),
              min_shares_limit: BigInt(minSharesToGet),
              farm_entries: activeFarms.map((farm) => [
                farm.globalFarmId,
                farm.yieldFarmId,
              ]),
            })
          : papi.tx.Omnipool.add_liquidity_with_limit({
              asset: Number(erc20Id),
              amount: BigInt(amountToJoinOmnipool),
              min_shares_limit: BigInt(minSharesToGet),
            })

        const omnipoolDispatchTx = papi.tx.Dispatcher.dispatch_with_extra_gas({
          call: omnipoolTx.decodedCall,
          extra_gas: AAVE_EXTRA_GAS,
        })

        const tOptions = {
          value: t("common:currency", {
            value: minGETHToGet,
            symbol: meta.symbol,
          }),
          where: "Omnipool",
        }

        const joinOmnipoolToasts = {
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
        }
        await createTransaction(
          {
            tx: omnipoolDispatchTx,
            toasts: joinOmnipoolToasts,
          },
          { onSubmitted: props.onBack },
        )
      } else if (split) {
        const initialShares = getTransferableBalance(pool.id.toString())

        await createTransaction({
          tx: [
            {
              stepTitle: t("liquidity.add.modal.stepper.addLiquidity"),
              tx: async () => {
                // provide liquidity and get stableswap shares
                const assetsToProvideFormatted = assetsToProvide.map(
                  ({ asset, amount }) => ({
                    asset_id: Number(asset.id),
                    amount: BigInt(scale(amount, asset.decimals)),
                  }),
                )

                const tx = papi.tx.Dispatcher.dispatch_with_extra_gas({
                  call: papi.tx.Stableswap.add_assets_liquidity({
                    pool_id: pool.id,
                    assets: assetsToProvideFormatted,
                    min_shares: BigInt(minStablepoolShares),
                  }).decodedCall,
                  extra_gas: AAVE_EXTRA_GAS,
                })

                const providedValue = assetsToProvide
                  .map(({ asset, amount }) =>
                    t("common:currency", {
                      value: amount,
                      symbol: asset.symbol,
                    }),
                  )
                  .join(", ")

                const tOptions = {
                  value: providedValue,
                  where: stableswapMeta.symbol,
                }

                const toasts = {
                  submitted: t("liquidity.add.modal.toast.submitted", tOptions),
                  success: t("liquidity.add.modal.toast.success", tOptions),
                }

                return {
                  title: t("liquidity.add.modal.stepper.addLiquidity"),
                  tx,
                  toasts,
                }
              },
            },
            {
              stepTitle: t("liquidity.add.modal.stepper.joinOmnipool"),
              tx: async (results) => {
                const addingSharesResult = results[0]

                let addedShares = 0n

                if (
                  addingSharesResult &&
                  isSubstrateTxResult(addingSharesResult)
                ) {
                  addedShares =
                    papi.event.Stableswap.LiquidityAdded.filter(
                      addingSharesResult.events,
                    ).find((event) => event.who === account?.address)?.shares ??
                    0n
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
                  stableswapMeta.decimals,
                ).toString()

                const swap = await sdk.api.router.getBestSell(
                  pool.id,
                  Number(erc20Id),
                  addedSharesShifted,
                )

                // swap stableswap shares to erc20 token
                const swapTx = await sdk.tx
                  .trade(swap)
                  .withSlippage(slippage)
                  .withBeneficiary(account.address)
                  .build()
                  .then((tx) => tx.get())

                const minSharesToGet =
                  getOmnipoolGetShares(addedSharesShifted)?.minSharesToGet

                if (!minSharesToGet)
                  throw new Error("minSharesToGet is not found")

                const omnipoolTx = isJoinFarms
                  ? papi.tx.OmnipoolLiquidityMining.add_liquidity_and_join_farms(
                      {
                        asset: Number(erc20Id),
                        amount: BigInt(addedShares),
                        min_shares_limit: BigInt(minSharesToGet),
                        farm_entries: activeFarms.map((farm) => [
                          farm.globalFarmId,
                          farm.yieldFarmId,
                        ]),
                      },
                    )
                  : papi.tx.Omnipool.add_liquidity_with_limit({
                      asset: Number(erc20Id),
                      amount: BigInt(addedShares),
                      min_shares_limit: BigInt(minSharesToGet),
                    })

                const omnipoolDispatchTx =
                  papi.tx.Dispatcher.dispatch_with_extra_gas({
                    call: omnipoolTx.decodedCall,
                    extra_gas: AAVE_EXTRA_GAS,
                  })

                const tOptions = {
                  value: t("common:currency", {
                    value: addedSharesShifted,
                    symbol: meta.symbol,
                  }),
                  where: "Omnipool",
                }

                const joinOmnipoolToasts = {
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
                }

                // join omnipool with erc20 token
                const tx = papi.tx.Utility.batch_all({
                  calls: [swapTx, omnipoolDispatchTx].map((t) => t.decodedCall),
                })

                return {
                  tx,
                  title: t("liquidity.add.modal.stepper.getAsset", {
                    symbol: meta.symbol,
                  }),
                  toasts: joinOmnipoolToasts,
                }
              },
            },
          ],
        })
      } else {
        if (!tradeTx) throw new Error("Trade not found")
        const initialGethBalance = await getTransferableBalance(erc20Id)

        await createTransaction({
          tx: [
            {
              stepTitle: t("liquidity.add.modal.stepper.addLiquidity"),
              tx: async () => {
                const tOptions = {
                  value: t("common:currency", {
                    value: minGETHToGet,
                    symbol: meta.symbol,
                  }),
                  where: meta.symbol,
                }

                const toasts = {
                  submitted: t("liquidity.add.modal.toast.submitted", tOptions),
                  success: t("liquidity.add.modal.toast.success", tOptions),
                }

                return {
                  title: t("liquidity.add.modal.stepper.addLiquidity"),
                  tx: tradeTx,
                  toasts,
                }
              },
            },
            {
              stepTitle: t("liquidity.add.modal.stepper.joinOmnipool"),
              tx: async () => {
                const { client } = sdk
                const { balance } = client

                const shares = await balance.getBalance(
                  account?.address ?? "",
                  Number(erc20Id),
                )

                const addedGeth = shares.transferable - initialGethBalance
                const addedGethShifted = scaleHuman(
                  addedGeth.toString(),
                  meta.decimals,
                )
                const minSharesToGet =
                  getOmnipoolGetShares(addedGethShifted)?.minSharesToGet

                if (!minSharesToGet)
                  throw new Error("minSharesToGet is not found")

                const omnipoolTx = isJoinFarms
                  ? papi.tx.OmnipoolLiquidityMining.add_liquidity_and_join_farms(
                      {
                        asset: Number(erc20Id),
                        amount: BigInt(addedGeth),
                        min_shares_limit: BigInt(minSharesToGet),
                        farm_entries: activeFarms.map((farm) => [
                          farm.globalFarmId,
                          farm.yieldFarmId,
                        ]),
                      },
                    )
                  : papi.tx.Omnipool.add_liquidity_with_limit({
                      asset: Number(erc20Id),
                      amount: BigInt(addedGeth),
                      min_shares_limit: BigInt(minSharesToGet),
                    })

                const tx = papi.tx.Dispatcher.dispatch_with_extra_gas({
                  call: omnipoolTx.decodedCall,
                  extra_gas: AAVE_EXTRA_GAS,
                })

                const tOptions = {
                  value: t("common:currency", {
                    value: addedGethShifted,
                    symbol: meta.symbol,
                  }),
                  where: "Omnipool",
                }

                const joinOmnipoolToasts = {
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
                }

                return {
                  tx,
                  title: t("liquidity.add.modal.stepper.joinOmnipool"),
                  toasts: joinOmnipoolToasts,
                }
              },
            },
          ],
        })
      }
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
  const getMinimumTradeAmount = useMinimumTradeAmount()

  const { papi, sdk } = rpc
  const { erc20Id, assetsToProvide, stablepoolAssets } = formData
  const {
    stableswapId,
    stablepoolDetails: { pool },
    onBack,
  } = props

  const meta = getAssetWithFallback(stableswapId)
  const erc20Meta = getAssetWithFallback(erc20Id)

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

  const tradeAmountOut = split
    ? (trade?.swap.amountOut ?? "0")
    : (getMinimumTradeAmount(trade?.swap)?.toString() ?? "0")
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

      if (split) {
        const assetsToProvideFormatted = assetsToProvide.map(
          ({ asset, amount }) => ({
            asset_id: Number(asset.id),
            amount: BigInt(scale(amount, asset.decimals)),
          }),
        )
        const initialShares = getTransferableBalance(pool.id.toString())

        const firstTx = papi.tx.Dispatcher.dispatch_with_extra_gas({
          call: papi.tx.Stableswap.add_assets_liquidity({
            pool_id: pool.id,
            assets: assetsToProvideFormatted,
            min_shares: BigInt(minStablepoolShares),
          }).decodedCall,
          extra_gas: AAVE_EXTRA_GAS,
        })

        const providedValue = assetsToProvide
          .map(({ asset, amount }) =>
            t("common:currency", {
              value: amount,
              symbol: asset.symbol,
            }),
          )
          .join(", ")

        await createTransaction({
          tx: [
            {
              stepTitle: t("liquidity.add.modal.stepper.addLiquidity"),
              tx: async () => {
                const tOptions = {
                  value: providedValue,
                  where: meta.symbol,
                }

                const toasts = {
                  submitted: t("liquidity.add.modal.toast.submitted", tOptions),
                  success: t("liquidity.add.modal.toast.success", tOptions),
                }

                return {
                  title: t("liquidity.add.modal.stepper.addLiquidity"),
                  tx: firstTx,
                  toasts,
                }
              },
            },
            {
              stepTitle: t("liquidity.add.modal.stepper.getAsset", {
                symbol: erc20Meta.symbol,
              }),
              tx: async (results) => {
                const addingSharesResult = results[0]

                let addedShares = 0n

                if (
                  addingSharesResult &&
                  isSubstrateTxResult(addingSharesResult)
                ) {
                  addedShares =
                    papi.event.Stableswap.LiquidityAdded.filter(
                      addingSharesResult.events,
                    ).find((event) => event.who === account.address)?.shares ??
                    0n
                } else {
                  const { client } = sdk
                  const { balance } = client

                  const shares = await balance.getBalance(
                    account.address,
                    pool.id,
                  )

                  addedShares = shares.transferable - initialShares
                }

                const addedSharesShifted = scaleHuman(
                  addedShares.toString(),
                  meta.decimals,
                ).toString()

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

                const tOptions = {
                  value: providedValue,
                  where: erc20Meta.symbol,
                }

                const toasts = {
                  submitted: t("liquidity.add.modal.toast.submitted", tOptions),
                  success: t("liquidity.add.modal.toast.success", tOptions),
                }

                return {
                  tx: swapTx,
                  title: t("liquidity.add.modal.stepper.getAsset", {
                    symbol: erc20Meta.symbol,
                  }),
                  toasts,
                }
              },
            },
          ],
        })
      } else {
        if (!trade?.tx) throw new Error("Trade not found")

        const providedValue = first(
          assetsToProvide.map(({ asset, amount }) =>
            t("common:currency", {
              value: amount,
              symbol: asset.symbol,
            }),
          ),
        )

        const tOptions = {
          value: providedValue,
          where: erc20Meta.symbol,
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
