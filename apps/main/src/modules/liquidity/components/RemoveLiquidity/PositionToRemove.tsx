import { Amount, Checkbox, Text } from "@galacticcouncil/ui/components"
import { Flex } from "@galacticcouncil/ui/components/Flex"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { XykDeposit } from "@/api/account"
import { Farm } from "@/api/farms"
import { AssetLogo } from "@/components/AssetLogo"
import { useCurrentFarmPeriod } from "@/modules/liquidity/components/Farms/Farms.utils"
import { getCurrentLoyaltyFactor } from "@/modules/liquidity/components/JoinFarms/JoinFarms.utils"
import { AccountOmnipoolPosition, isDepositPosition } from "@/states/account"

import { SPositionToRemove } from "./PositionToRemove.styled"

export const PositionToRemove = ({
  position,
  activeFarms,
  selected,
  value,
  displayValue,
  onClick,
}: {
  position: AccountOmnipoolPosition | XykDeposit
  value: string
  displayValue: string
  selected: boolean
  activeFarms?: Farm[]
  onClick: (position: AccountOmnipoolPosition | XykDeposit) => void
}) => {
  const { t } = useTranslation(["liquidity", "common"])
  const isDeposit = isDepositPosition(position)
  const getCurrentFarmPeriod = useCurrentFarmPeriod()

  const { aprsByRewardAsset, joinedFarms } = useMemo(() => {
    if (!isDeposit || !activeFarms)
      return { aprsByRewardAsset: [], joinedFarms: [] }

    const joinedFarms = activeFarms
      .map((farm) => {
        const farmEntry = position.yield_farm_entries?.find(
          (entry) => entry.global_farm_id === farm.globalFarmId,
        )

        const period = getCurrentFarmPeriod(1)

        if (!farmEntry || !period) return null

        return {
          farm,
          farmEntry,
          period,
        }
      })
      .filter((farm) => farm !== null)

    const totalAprs = joinedFarms.reduce(
      (acc, { farm, farmEntry, period }) => {
        const currentPeriodInFarm = Big(period)
          .minus(farmEntry.entered_at)
          .toNumber()

        const currentApr = farm.loyaltyCurve
          ? Big(farm.apr)
              .times(
                getCurrentLoyaltyFactor(farm.loyaltyCurve, currentPeriodInFarm),
              )
              .toString()
          : farm.apr

        const key = String(farm.rewardCurrency)
        const value = currentApr ? Big(currentApr) : Big(0)

        acc[key] = (acc[key] ?? Big(0)).plus(value)

        return acc
      },
      {} as Record<string, Big>,
    )

    const aprsByRewardAsset = Object.entries(totalAprs).map(
      ([rewardAsset, totalApr]) => ({
        rewardAsset,
        totalApr: totalApr.toString(),
      }),
    )

    return { aprsByRewardAsset, joinedFarms }
  }, [position, activeFarms, getCurrentFarmPeriod, isDeposit])

  return (
    <SPositionToRemove selected={selected} onClick={() => onClick(position)}>
      <Flex align="center" gap={8}>
        <Checkbox checked={selected} onChange={() => onClick(position)} />
        <Amount
          value={value}
          displayValue={t("common:currency", {
            value: displayValue,
          })}
        />
      </Flex>

      {!!aprsByRewardAsset.length && (
        <Flex align="center" gap={getTokenPx("containers.paddings.quint")}>
          <AssetLogo
            size="small"
            id={joinedFarms.map(({ farm }) => farm.rewardCurrency.toString())}
          />
          <Text fs="p6" color={getToken("text.tint.secondary")}>
            {aprsByRewardAsset
              .map((apr) => t("common:percent", { value: apr.totalApr }))
              .join(" + ")}
          </Text>
        </Flex>
      )}
    </SPositionToRemove>
  )
}
