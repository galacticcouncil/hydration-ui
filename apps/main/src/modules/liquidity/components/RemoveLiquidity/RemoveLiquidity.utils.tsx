import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import Big from "big.js"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import z, { ZodType } from "zod/v4"

import { OmnipoolDepositFull, XykDeposit } from "@/api/account"
import { TAssetData } from "@/api/assets"
import { useRelayChainBlockNumber } from "@/api/chain"
import {
  FarmDepositReward,
  useFarmRewards,
  useOmnipoolActiveFarm,
} from "@/api/farms"
import { TSelectedAsset } from "@/components/AssetSelect/AssetSelect"
import { useAssets } from "@/providers/assetsProvider"
import {
  AccountOmnipoolPosition,
  isDepositPosition,
  useAccountOmnipoolPositionsData,
} from "@/states/account"
import { scaleHuman } from "@/utils/formatting"

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
