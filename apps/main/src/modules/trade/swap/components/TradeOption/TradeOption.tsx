import { Flex, OptionCard, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { useTranslation } from "react-i18next"
import { isNullish } from "remeda"

import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { TAsset } from "@/providers/assetsProvider"

type Props = {
  readonly asset: TAsset
  readonly label: string
  readonly time: string
  readonly active: boolean
  readonly value: string
  readonly diff?: string
  readonly isBuy?: boolean
  readonly approx?: boolean
  readonly onClick: () => void
  readonly disabled?: boolean
}

export const TradeOption = ({
  asset,
  label,
  time,
  active,
  value,
  diff,
  isBuy,
  approx,
  onClick,
  disabled,
}: Props) => {
  const { t } = useTranslation()

  const [displayValue] = useDisplayAssetPrice(asset.id, value)
  const [displayDiff] = useDisplayAssetPrice(asset.id, diff || "0")

  const isPositive = Big(diff || "0").gte(0)

  return (
    <OptionCard
      label={label}
      description={time}
      value={`${approx ? "~" : ""}${t("currency", {
        value: value,
        symbol: asset.symbol,
      })}`}
      displayValue={
        <Flex gap="s" align="center">
          <Text fs="p6" fw={400} color={getToken("text.medium")}>
            {displayValue}
          </Text>
          {!isNullish(diff) && (
            <Text
              fs="p6"
              fw={600}
              color={
                isBuy
                  ? isPositive
                    ? getToken("accents.danger.emphasis")
                    : getToken("accents.success.emphasis")
                  : isPositive
                    ? getToken("accents.success.emphasis")
                    : getToken("accents.danger.emphasis")
              }
            >
              ({isPositive && "+"}
              {displayDiff})
            </Text>
          )}
        </Flex>
      }
      isActive={active}
      onClick={onClick}
      disabled={disabled}
    />
  )
}
