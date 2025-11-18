import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import Big from "big.js"
import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import z, { ZodType } from "zod/v4"

import { OmnipoolDepositFull, XykDeposit } from "@/api/account"
import { AssetType, TAssetData } from "@/api/assets"
import { useRelayChainBlockNumber } from "@/api/chain"
import {
  FarmDepositReward,
  useFarmRewards,
  useOmnipoolActiveFarm,
} from "@/api/farms"
import { TSelectedAsset } from "@/components/AssetSelect/AssetSelect"
import { TAssetWithBalance } from "@/components/AssetSelectModal/AssetSelectModal.utils"
import { TReserve } from "@/modules/liquidity/Liquidity.utils"
import { useAssets } from "@/providers/assetsProvider"
import {
  AccountOmnipoolPosition,
  isDepositPosition,
  useAccountBalances,
  useAccountOmnipoolPositionsData,
} from "@/states/account"
import { useAssetsPrice } from "@/states/displayAsset"
import { scaleHuman } from "@/utils/formatting"
import { sortAssets } from "@/utils/sort"

export type TRemoveLiquidityFormValues = {
  amount: string
  asset: TSelectedAsset
}

export type RewardToReceive = {
  value: string
  asset: TAssetData
}

export const useRemoveLiquidityForm = ({
  asset,
  initialAmount,
  rule,
}: {
  asset?: TSelectedAsset
  initialAmount?: string
  rule?: ZodType<string, string> | undefined
}) => {
  return useForm<TRemoveLiquidityFormValues>({
    mode: "onChange",
    defaultValues: { amount: initialAmount ?? "", asset },
    resolver: rule
      ? standardSchemaResolver(
          z.object({ amount: rule, asset: z.custom<TSelectedAsset>() }),
        )
      : undefined,
  })
}

export const useRemoveSelectablePositions = ({
  poolId,
}: {
  poolId: string
}) => {
  const { getAssetWithFallback } = useAssets()
  const { getAssetPositions } = useAccountOmnipoolPositionsData()
  const { all } = getAssetPositions(poolId)
  const { data: activeFarms } = useOmnipoolActiveFarm(poolId)

  const [selectedPositionIds, setSelectedPositionIds] = useState<Set<string>>(
    new Set(),
  )

  const meta = getAssetWithFallback(poolId)

  const positions = all.map((position) => {
    const isSelected = selectedPositionIds.has(position.positionId)

    return {
      ...position,
      isSelected,
    }
  })

  const selectedPositions = positions.filter((pos) => pos.isSelected)

  const removableValues = useRemoveSelectablePositionsTotalValue({
    positions: selectedPositions,
    meta,
  })

  return {
    removableValues,
    meta,
    positions,
    activeFarms,
    setSelectedPositionIds,
    selectedPositionIds,
    selectedPositions,
    selectedDeposits: selectedPositions.filter((pos) => isDepositPosition(pos)),
  }
}

export const useRemoveSelectablePositionsTotalValue = ({
  positions,
  meta,
}: {
  positions: AccountOmnipoolPosition[]
  meta: TAssetData
}) => {
  const { hub } = useAssets()

  const totalValue = positions.reduce(
    (acc, pos) => ({
      value: acc.value.plus(pos.data.currentValueHuman),
      displayValue: acc.displayValue.plus(pos.data.currentDisplay),
      hubValue: acc.hubValue.plus(pos.data.currentHubValueHuman),
      hubDisplayValue: acc.hubDisplayValue.plus(pos.data.currentHubDisplay),
    }),
    {
      value: Big(0),
      displayValue: Big(0),
      hubValue: Big(0),
      hubDisplayValue: Big(0),
    },
  )

  const values = [
    {
      asset: meta,
      value: totalValue.value.toString(),
      displayValue: totalValue.displayValue.toString(),
    },
  ]

  if (totalValue.hubDisplayValue.gt(0)) {
    values.push({
      asset: hub,
      value: totalValue.hubValue.toString(),
      displayValue: totalValue.hubDisplayValue.toString(),
    })
  }

  return values
}

export const useRemoveSelectablePositionsRewards = (
  positions: { reward?: FarmDepositReward }[],
) => {
  const { getAssetWithFallback } = useAssets()

  return Object.entries(
    positions.reduce(
      (acc, { reward }) => {
        if (reward) {
          const existingReward = acc[reward.assetId]

          if (existingReward) {
            acc[reward.assetId] = existingReward + reward.reward
          } else {
            acc[reward.assetId] = reward.reward
          }
        }

        return acc
      },
      {} as Record<string, bigint>,
    ),
  ).map(([assetId, value]) => {
    const asset = getAssetWithFallback(assetId)

    return {
      asset,
      value: value.toString(),
    }
  })
}

export const useTotalRewardsToReceive = (
  positions: Array<XykDeposit | OmnipoolDepositFull>,
) => {
  const relayChainBlockNumber = useRelayChainBlockNumber(true)

  const { data: rewards, isLoading } = useFarmRewards(
    positions,
    relayChainBlockNumber,
  )

  const totalRewards = useRemoveSelectablePositionsRewards(
    rewards?.map(({ rewards }) => ({ reward: rewards })) ?? [],
  )

  return { value: totalRewards, isLoading: isLoading }
}

export const useFormatRewards = (rewards: RewardToReceive[]) => {
  const { t } = useTranslation("common")

  return rewards.length
    ? rewards
        .map(({ value, asset }) =>
          t("currency", {
            value: scaleHuman(value, asset.decimals),
            symbol: asset.symbol,
          }),
        )
        .join(" + ")
    : "0"
}

export const useAssetsToRemoveFromMoneyMarket = ({
  stableswapId,
  reserves,
  options,
}: {
  stableswapId: string
  reserves: TReserve[]
  options?: { blacklist?: string[] }
}) => {
  const { blacklist = [] } = options ?? {}
  const { balances } = useAccountBalances()
  const {
    getAssetWithFallback,
    isStableSwap,
    getErc20AToken,
    native,
    tradable,
  } = useAssets()

  const stableswapMeta = getAssetWithFallback(stableswapId)

  const highPriorityAssetIds = useMemo(() => {
    const assetIds: string[] = [stableswapId]

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
  }, [getAssetWithFallback, getErc20AToken, reserves, stableswapId])

  const { validAssets, priceIds } = useMemo(() => {
    const validAssets = new Map<string, TAssetWithBalance>()
    const priceIds = []

    for (const balance of Object.values(balances)) {
      if (blacklist.includes(balance.assetId)) continue

      const meta = getAssetWithFallback(balance.assetId)
      if (!meta.isTradable) continue

      priceIds.push(balance.assetId)
      validAssets.set(balance.assetId, {
        ...meta,
        balance: scaleHuman(balance.transferable, meta.decimals),
      })
    }

    return { validAssets, priceIds }
  }, [balances, getAssetWithFallback, blacklist])

  const { getAssetPrice, isLoading } = useAssetsPrice(priceIds)

  const sortedAssets = useMemo((): TAssetWithBalance[] => {
    if (!isStableSwap(stableswapMeta)) {
      console.error("stableswapId is not a stableswap asset type")

      return []
    }
    if (isLoading) return []

    const validAssetsWithBalance = tradable.map((asset) => {
      const balance = validAssets.get(asset.id)?.balance

      if (balance) {
        const { price, isValid } = getAssetPrice(asset.id)

        const balanceDisplay = isValid
          ? Big(price).times(balance).toString()
          : "0"

        return { ...asset, balance, balanceDisplay }
      } else {
        return { ...asset, balanceDisplay: "0" }
      }
    })

    return sortAssets(validAssetsWithBalance, "balanceDisplay", {
      lowPriorityAssetIds: [native.id],
      highPriorityAssetIds,
    })
  }, [
    getAssetPrice,
    isLoading,
    isStableSwap,
    native.id,
    stableswapMeta,
    tradable,
    validAssets,
    highPriorityAssetIds,
  ])

  return sortedAssets
}

export const useAssetsToRemoveFromStablepool = ({
  reserves,
}: {
  reserves: TReserve[]
}): TAssetWithBalance[] => {
  const { native } = useAssets()
  const { getTransferableBalance } = useAccountBalances()

  const sortedAssets = useMemo(() => {
    let maxReserve: TReserve | undefined = undefined
    const assetsWithBalance: (TAssetData & {
      balance: string
      balanceDisplay: string
    })[] = []

    for (const reserve of reserves) {
      if (!maxReserve) maxReserve = reserve
      if (Big(reserve.displayAmount).gt(Big(maxReserve.displayAmount))) {
        maxReserve = reserve
      }

      const price = Big(reserve.displayAmount).div(reserve.amountHuman)

      const balance = scaleHuman(
        getTransferableBalance(reserve.asset_id.toString()),
        reserve.meta.decimals,
      )
      const balanceDisplay = Big(price).times(balance).toString()

      assetsWithBalance.push({ ...reserve.meta, balance, balanceDisplay })
    }

    return sortAssets(assetsWithBalance, "balanceDisplay", {
      lowPriorityAssetIds: [native.id],
      highPriorityAssetIds: maxReserve ? [maxReserve.meta.id] : [],
    })
  }, [getTransferableBalance, reserves, native.id])

  return sortedAssets
}
