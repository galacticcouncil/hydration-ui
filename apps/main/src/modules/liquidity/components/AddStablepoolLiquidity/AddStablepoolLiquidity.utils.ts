import { calculate_shares } from "@galacticcouncil/math-stableswap"
import { useAccount } from "@galacticcouncil/web3-connect"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useMutation } from "@tanstack/react-query"
import Big from "big.js"
import { t } from "i18next"
import { useEffect, useMemo } from "react"
import { ResolverOptions, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import z from "zod"

import { omnipoolMiningPositionsKey, omnipoolPositionsKey } from "@/api/account"
import { AssetType, TAssetData } from "@/api/assets"
import { StableSwapBase } from "@/api/pools"
import { TAssetWithBalance } from "@/components/AssetSelectModal/AssetSelectModal.utils"
import {
  useAddToOmnipoolZod,
  useCheckJoinOmnipoolFarm,
} from "@/modules/liquidity/components/AddLiquidity/AddLiqudity.utils"
import {
  calculatePoolFee,
  TReserve,
  TStablepoolDetails,
  useAddableStablepoolTokens,
} from "@/modules/liquidity/Liquidity.utils"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAccountBalances } from "@/states/account"
import { useAssetsPrice } from "@/states/displayAsset"
import { useTradeSettings } from "@/states/tradeSettings"
import { useTransactionsStore } from "@/states/transactions"
import { scale, scaleHuman } from "@/utils/formatting"
import { sortAssets } from "@/utils/sort"
import {
  maxBalanceError,
  positive,
  required,
  validateMaxBalance,
} from "@/utils/validators"

export type TReserveFormValue = {
  asset: TAssetData
  amount: string
}

type TField = {
  amount: string
  assetId: string
}

export type TAddStablepoolLiquidityOption = "omnipool" | "stablepool"

export type TAddStablepoolLiquidityFormValues = {
  sharesAmount: string
  option: TAddStablepoolLiquidityOption
  split: boolean
  selectedAssetId: string
  fields: Array<TField>
  activeFields: Array<TField>
}

export const addStablepoolOptions = [
  {
    id: "omnipool",
    label: t("liquidity:liquidity.add.modal.option.omnipool"),
    value: "omnipool",
  },
  {
    id: "stablepool",
    label: t("liquidity:liquidity.add.modal.option.stablepool"),
    value: "stablepool",
  },
]

export const useStablepoolAddLiquidity = ({
  stablepoolDetails: { pool, reserves },
  stableswapId,
  onSubmitted,
}: {
  stablepoolDetails: TStablepoolDetails
  stableswapId: string
  onSubmitted: () => void
}) => {
  const { t } = useTranslation(["liquidity", "common"])
  const { getAssetWithFallback } = useAssets()
  const { papi } = useRpcProvider()
  const createTransaction = useTransactionsStore((s) => s.createTransaction)
  const { getTransferableBalance } = useAccountBalances()
  const {
    liquidity: { slippage },
  } = useTradeSettings()
  const addebleReserves = useAddableStablepoolTokens(stableswapId, reserves)
  const { account } = useAccount()
  const meta = getAssetWithFallback(stableswapId)

  const { stablepoolAssets, accountBalances } = useMemo(() => {
    const stablepoolAssets: { asset: TAssetData; balance: string }[] = []
    const accountBalances: Map<string, string> = new Map()
    for (const reserve of reserves) {
      stablepoolAssets.push({
        asset: reserve.meta,
        balance: reserve.amount,
      })

      accountBalances.set(
        reserve.asset_id.toString(),
        scaleHuman(
          getTransferableBalance(reserve.asset_id.toString()),
          reserve.meta.decimals,
        ),
      )
    }

    return { stablepoolAssets, accountBalances }
  }, [reserves, getTransferableBalance])

  const reserveIds = addebleReserves.map((reserve) =>
    reserve.asset_id.toString(),
  )

  const assetsToSelect = useAssetsToAddToStablepool({
    reserves: addebleReserves,
  })
  const initialAssetIdToAdd = assetsToSelect[0]?.id

  const form = useStablepoolAddLiquidityForm({
    poolId: stableswapId,
    accountBalances,
    activeFieldIds: reserveIds,
    selectedAssetId: initialAssetIdToAdd ?? "",
  })
  const [option, activeFields, selectedAssetId] = form.watch([
    "option",
    "activeFields",
    "selectedAssetId",
  ])

  const assetsToProvide = activeFields
    .filter(({ amount }) => Big(amount || "0").gt(0))
    .map(({ assetId, amount }) => ({
      asset: getAssetWithFallback(assetId),
      amount,
    }))

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

  const { isJoinFarms, joinFarmErrorMessage, activeFarms } =
    useCheckJoinOmnipoolFarm({
      amount: stablepoolSharesHuman,
      meta,
      disabled: option === "stablepool",
    })

  const minReceiveAmount = stablepoolSharesHuman

  useEffect(() => {
    if (!selectedAssetId && initialAssetIdToAdd) {
      form.setValue("selectedAssetId", initialAssetIdToAdd, {
        shouldValidate: true,
      })
    }
  }, [form, initialAssetIdToAdd, selectedAssetId])

  useEffect(() => {
    form.setValue("sharesAmount", stablepoolSharesHuman, {
      shouldValidate: true,
    })
  }, [form, stablepoolSharesHuman])

  const mutation = useMutation({
    mutationFn: async (): Promise<void> => {
      if (!assetsToProvide.length) throw new Error("No assets to provide")

      const assetsToProvideFormatted = assetsToProvide.map(
        ({ asset, amount }) => ({
          asset_id: Number(asset.id),
          amount: BigInt(scale(amount, asset.decimals)),
        }),
      )

      const tx =
        option === "stablepool"
          ? papi.tx.Stableswap.add_assets_liquidity({
              pool_id: pool.id,
              assets: assetsToProvideFormatted,
              min_shares: BigInt(minStablepoolShares),
            })
          : papi.tx.OmnipoolLiquidityMining.add_liquidity_stableswap_omnipool_and_join_farms(
              {
                stable_pool_id: pool.id,
                stable_asset_amounts: assetsToProvideFormatted,
                farm_entries: isJoinFarms
                  ? activeFarms.map((farm) => [
                      farm.globalFarmId,
                      farm.yieldFarmId,
                    ])
                  : undefined,
              },
            )

      const toastValue = assetsToProvide
        .map(({ asset, amount }) =>
          t("common:currency", {
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
          tx,
          toasts,
          invalidateQueries:
            option === "stablepool"
              ? undefined
              : [
                  omnipoolPositionsKey(account?.address ?? ""),
                  omnipoolMiningPositionsKey(account?.address ?? ""),
                ],
        },
        { onSubmitted },
      )
    },
  })

  return {
    form,
    accountBalances,
    assetsToSelect,
    minReceiveAmount,
    meta,
    mutation,
    activeFarms: option === "omnipool" ? activeFarms : [],
    joinFarmErrorMessage,
    isJoinFarms,
    healthFactor: undefined,
    reserveIds,
    displayOption: true,
  }
}

export const getStablepoolShares = (
  formValues: TReserveFormValue[],
  stablepoolAssets: Array<{ asset: TAssetData; balance: string }>,
  pool: StableSwapBase,
) => {
  const { amplification, totalIssuance, pegs, fee } = pool
  const calculatedFee = calculatePoolFee(fee)

  if (!calculatedFee) return 0

  const assetsFormatted = formValues
    .filter(({ amount }) => Big(amount || "0").gt(0))
    .map(({ asset, amount }) => ({
      asset_id: Number(asset.id),
      amount: scale(amount, asset.decimals),
    }))

  const reservesFormatted = stablepoolAssets.map(({ asset, balance }) => ({
    asset_id: Number(asset.id),
    amount: balance,
    decimals: asset.decimals,
  }))

  const shares = calculate_shares(
    JSON.stringify(reservesFormatted),
    JSON.stringify(assetsFormatted),
    amplification.toString(),
    totalIssuance.toString(),
    scaleHuman(calculatedFee, 2),
    JSON.stringify(pegs),
  )

  return Math.max(Number(shares), 0)
}

const useStablepoolAddLiquidityFormResolver = (
  poolId: string,
  accountReserveBalances: Map<string, string>,
) => {
  const omnipoolZodSchema = useAddToOmnipoolZod(poolId, true)

  return (
    values: TAddStablepoolLiquidityFormValues,
    context: unknown,
    options: ResolverOptions<TAddStablepoolLiquidityFormValues>,
  ) => {
    const fieldsSchema = z.array(
      z
        .object({
          amount: z.string(),
          assetId: z.string(),
        })
        .refine(
          (field) => {
            const maxBalance = accountReserveBalances.get(field.assetId)
            if (!maxBalance) return true
            return validateMaxBalance(maxBalance, field.amount || "0")
          },
          {
            message: maxBalanceError,
          },
        ),
    )

    const schema = z.object({
      sharesAmount: omnipoolZodSchema ?? required.pipe(positive),
      option: z.enum(["omnipool", "stablepool"]),
      split: z.boolean(),
      selectedAssetId: z.string(),
      activeFields: fieldsSchema,
      fields: z.array(
        z.object({
          amount: z.string(),
          assetId: z.string(),
        }),
      ),
    })

    return standardSchemaResolver<
      TAddStablepoolLiquidityFormValues,
      unknown,
      TAddStablepoolLiquidityFormValues
    >(schema)(values, context, options)
  }
}

export const useStablepoolAddLiquidityForm = ({
  poolId,
  accountBalances,
  option = "omnipool",
  activeFieldIds,
  selectedAssetId,
  split = true,
}: {
  poolId: string
  option?: TAddStablepoolLiquidityOption
  accountBalances: Map<string, string>
  activeFieldIds: string[]
  selectedAssetId: string
  split?: boolean
}) => {
  const resolver = useStablepoolAddLiquidityFormResolver(
    poolId,
    accountBalances,
  )

  const fields = split
    ? activeFieldIds.map((id) => ({
        amount: "",
        assetId: id,
      }))
    : [
        {
          amount: "",
          assetId: selectedAssetId,
        },
      ]

  return useForm<TAddStablepoolLiquidityFormValues>({
    mode: "all",
    defaultValues: {
      option,
      sharesAmount: "",
      split,
      fields,
      activeFields: fields,
      selectedAssetId,
    },
    resolver,
  })
}

export const useAssetsToAddToMoneyMarket = ({
  stableswapId,
  reserves,
  options,
}: {
  stableswapId: string
  reserves: TReserve[]
  options?: {
    blacklist?: string[]
    highPriorityAssetIds?: string[]
    firstAssetId?: string
  }
}) => {
  const {
    blacklist = [],
    highPriorityAssetIds: initialHighPriorityAssetIds = [],
    firstAssetId,
  } = options ?? {}
  const { balances } = useAccountBalances()
  const { getAssetWithFallback, isStableSwap, getErc20AToken, native } =
    useAssets()

  const stableswapMeta = getAssetWithFallback(stableswapId)

  const highPriorityAssetIds = useMemo(() => {
    const assetIds: string[] = [...initialHighPriorityAssetIds, stableswapId]

    for (const reserve of reserves) {
      const reserveAsset = getAssetWithFallback(reserve.asset_id.toString())
      assetIds.push(reserveAsset.id)

      if (reserveAsset.type === AssetType.ERC20) {
        const underlyingAssetId = getErc20AToken(
          reserveAsset.id,
        )?.underlyingAssetId

        if (underlyingAssetId) {
          assetIds.push(underlyingAssetId)
        }
      }
    }

    return assetIds
  }, [
    getAssetWithFallback,
    getErc20AToken,
    reserves,
    stableswapId,
    initialHighPriorityAssetIds,
  ])

  const { validAssets, priceIds } = useMemo(() => {
    const validAssets = []
    const priceIds = []

    for (const balance of Object.values(balances)) {
      if (blacklist.includes(balance.assetId)) continue

      const meta = getAssetWithFallback(balance.assetId)
      if (!meta.isTradable) continue

      priceIds.push(balance.assetId)
      validAssets.push({
        ...meta,
        balance: scaleHuman(balance.transferable, meta.decimals),
      })
    }

    return { validAssets, priceIds }
  }, [balances, getAssetWithFallback, blacklist])

  const { getAssetPrice } = useAssetsPrice(priceIds)

  const validAssetsWithBalance = validAssets.map((asset) => {
    const { price, isValid } = getAssetPrice(asset.id)

    const balanceDisplay = isValid
      ? Big(price).times(asset.balance).toString()
      : "0"
    return { ...asset, balanceDisplay }
  })

  if (!isStableSwap(stableswapMeta)) {
    console.error("stableswapId is not a stableswap asset type")

    return []
  }

  const sortedAssets: TAssetWithBalance[] = sortAssets(
    validAssetsWithBalance,
    "balanceDisplay",
    {
      lowPriorityAssetIds: [native.id],
      highPriorityAssetIds,
      firstAssetId,
    },
  )

  return sortedAssets
}

export const useAssetsToAddToStablepool = ({
  reserves,
}: {
  reserves: TReserve[]
}): TAssetWithBalance[] => {
  const { native } = useAssets()
  const { getTransferableBalance } = useAccountBalances()

  const { minReserve, assetsWithBalance } = useMemo(() => {
    let minReserve: TReserve | undefined = undefined
    const assetsWithBalance: (TAssetData & {
      balance: string
      balanceDisplay: string
    })[] = []

    for (const reserve of reserves) {
      if (!minReserve) minReserve = reserve
      if (Big(reserve.displayAmount).lt(Big(minReserve.displayAmount))) {
        minReserve = reserve
      }

      const price = Big(reserve.displayAmount).div(reserve.amountHuman)

      const balance = scaleHuman(
        getTransferableBalance(reserve.asset_id.toString()),
        reserve.meta.decimals,
      )
      const balanceDisplay = Big(price).times(balance).toString()

      assetsWithBalance.push({ ...reserve.meta, balance, balanceDisplay })
    }

    return { minReserve, assetsWithBalance }
  }, [getTransferableBalance, reserves])

  const sortedAssets = sortAssets(assetsWithBalance, "balanceDisplay", {
    lowPriorityAssetIds: [native.id],
    highPriorityAssetIds: minReserve ? [minReserve.meta.id] : [],
  })

  return sortedAssets
}
