import { X } from "@galacticcouncil/ui/assets/icons"
import { Button, Flex, Icon } from "@galacticcouncil/ui/components"
import Big from "big.js"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import {
  marketPriceOptions,
  PriceSettings,
} from "@/modules/trade/otc/place-order/PlaceOrderModalContent.form"

export const PRICE_GAIN_DIFF_THRESHOLD = 0.1

type Props = {
  readonly isOfferView: boolean
  readonly price: string
  readonly priceGain: string
  readonly isPriceLoaded: boolean
  readonly onChange: (priceSettings: PriceSettings) => void
}

export const PlaceOrderPriceButtons: FC<Props> = ({
  isOfferView,
  price,
  priceGain,
  isPriceLoaded,
  onChange,
}) => {
  const { t } = useTranslation(["trade", "common"])

  const optionsWithFlags = marketPriceOptions.map(
    (option) =>
      [
        option,
        {
          isDefault: option === 0,
          isSelected: Big(priceGain)
            .minus(option)
            .abs()
            .lt(PRICE_GAIN_DIFF_THRESHOLD),
        },
      ] as const,
  )

  const hasCustomOption =
    !Big(price || "0").eq(0) &&
    !optionsWithFlags.some(([, { isSelected }]) => isSelected)

  if (!isPriceLoaded) {
    return (
      <Button size="micro" uppercase variant="muted" outline disabled>
        {t("otc.placeOrder.lastOmniPoolPrice")}
      </Button>
    )
  }

  return (
    <Flex align="center" gap="s">
      {optionsWithFlags.map(([option, { isDefault, isSelected }]) => {
        const isOmnipoolPrice = isDefault && !hasCustomOption
        const isCustom = isDefault && hasCustomOption

        const usedOption = isCustom ? priceGain : option
        const shownOption = isOfferView
          ? usedOption
          : Big(usedOption).times(-1).toString()

        return (
          <Button
            size="micro"
            uppercase
            outline
            key={option}
            variant={isCustom || isSelected ? "accent" : "muted"}
            onClick={() =>
              onChange({
                type: "relative",
                percentage: isCustom ? 0 : option,
              })
            }
          >
            {isOmnipoolPrice ? (
              t("otc.placeOrder.lastOmniPoolPrice")
            ) : (
              <Flex align="center">
                {Big(shownOption).gt(0) && "+"}
                {t("common:percent", {
                  value: Big(shownOption).toFixed(1, Big.roundDown),
                })}
                {isCustom && <Icon size="xs" component={X} />}
              </Flex>
            )}
          </Button>
        )
      })}
    </Flex>
  )
}
