import { Amount, Checkbox, Text } from "@galacticcouncil/ui/components"
import { Flex } from "@galacticcouncil/ui/components/Flex"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { XykDeposit } from "@/api/account"
import { Farm } from "@/api/farms"
import { AssetLogo } from "@/components/AssetLogo"
import { useDepositAprs } from "@/modules/liquidity/components/Farms/Farms.utils"
import { AccountOmnipoolPosition } from "@/states/account"

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
  const getDepositAprs = useDepositAprs()

  const { aprsByRewardAsset, joinedFarms } = useMemo(
    () => getDepositAprs(position, activeFarms ?? []),
    [position, activeFarms, getDepositAprs],
  )

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
              .map(({ apr }) => t("common:percent", { value: apr }))
              .join(" + ")}
          </Text>
        </Flex>
      )}
    </SPositionToRemove>
  )
}
