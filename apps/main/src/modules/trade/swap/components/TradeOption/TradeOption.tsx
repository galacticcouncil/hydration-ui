import { Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { useTranslation } from "react-i18next"
import { isNullish } from "remeda"

import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { TAsset } from "@/providers/assetsProvider"

import { STradeOptionContainer } from "./TradeOption.styled"

type Props = {
  readonly buyAsset: TAsset
  readonly label: string
  readonly time: string
  readonly active: boolean
  readonly value: string
  readonly diff?: string
  readonly onClick: () => void
  readonly disabled?: boolean
}

export const TradeOption = ({
  buyAsset,
  label,
  time,
  active,
  value,
  diff,
  onClick,
  disabled,
}: Props) => {
  const { t } = useTranslation()

  const [displayValue] = useDisplayAssetPrice(buyAsset.id, value)
  const [displayDiff] = useDisplayAssetPrice(buyAsset.id, diff || "0")

  const isPositive = Big(diff || "0").gte(0)

  return (
    <STradeOptionContainer
      type="button"
      onClick={onClick}
      active={active}
      disabled={disabled}
    >
      <Flex direction="column">
        <Text fs={14} lh={1} color={getToken("text.high")}>
          {label}
        </Text>
        <Text fs="p5" color={getToken("text.medium")}>
          {time}
        </Text>
      </Flex>
      <Flex direction="column" align="end">
        <Text fs={14} lh={1} fw={600} color={getToken("text.high")}>
          {t("currency", {
            value: value,
            symbol: buyAsset.symbol,
          })}
        </Text>
        <Flex gap={4} align="center">
          <Text fs="p6" fw={400} color={getToken("text.medium")}>
            {displayValue}
          </Text>
          {!isNullish(diff) && (
            <Text
              fs="p6"
              fw={600}
              color={
                isPositive
                  ? getToken("accents.success.emphasis")
                  : getToken("accents.danger.emphasis")
              }
            >
              ({isPositive && "+"}
              {displayDiff})
            </Text>
          )}
        </Flex>
      </Flex>
    </STradeOptionContainer>
  )
}
