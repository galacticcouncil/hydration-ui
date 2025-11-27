import { AssetIcon, X } from "@galacticcouncil/ui/assets/icons"
import {
  ButtonIcon,
  Flex,
  Icon,
  MicroButton,
  NumberInput,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, px } from "@galacticcouncil/ui/utils"
import { getReversePrice } from "@galacticcouncil/utils"
import Big from "big.js"
import { FC } from "react"
import { useController, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import {
  marketPriceOptions,
  PlaceOrderFormValues,
  PlaceOrderView,
  PriceSettings,
} from "@/modules/trade/otc/place-order/PlaceOrderModalContent.form"
import { TAsset } from "@/providers/assetsProvider"

export const PRICE_GAIN_DIFF_THRESHOLD = 0.1

type Props = {
  readonly offerAsset: TAsset
  readonly buyAsset: TAsset
  readonly price: string
  readonly priceGain: string
  readonly isPriceLoaded: boolean
  readonly onChange: (priceSettings: PriceSettings) => void
}

export const PlaceOrderPrice: FC<Props> = ({
  offerAsset,
  buyAsset,
  price,
  priceGain,
  isPriceLoaded,
  onChange,
}) => {
  const { t } = useTranslation(["trade", "common"])

  const { control } = useFormContext<PlaceOrderFormValues>()

  const { field: priceSettingsField } = useController({
    control,
    name: "priceSettings",
  })

  const { field: viewField } = useController({
    control,
    name: "view",
  })

  const isOfferView = viewField.value === "offerPrice"

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

  const changePriceSettings = (priceSettings: PriceSettings): void => {
    priceSettingsField.onChange(priceSettings)
    onChange(priceSettings)
  }

  return (
    <Flex py={8} direction="column" gap={4}>
      <Flex justify="space-between" height={18} align="center">
        <Text fw={500} fs="p5" lh={px(14.4)} color={getToken("text.medium")}>
          {t("otc.placeOrder.priceFor1", {
            symbol: isOfferView ? offerAsset.symbol : buyAsset.symbol,
          })}
        </Text>
        {!isPriceLoaded ? (
          <MicroButton disabled>
            {t("otc.placeOrder.lastOmniPoolPrice")}
          </MicroButton>
        ) : (
          <Flex align="center" gap={4}>
            {optionsWithFlags.map(([option, { isDefault, isSelected }]) => {
              const isOmnipoolPrice = isDefault && !hasCustomOption
              const isCustom = isDefault && hasCustomOption

              const usedOption = isCustom ? priceGain : option
              const shownOption = isOfferView
                ? usedOption
                : Big(usedOption).times(-1).toString()

              return (
                <MicroButton
                  key={option}
                  size="small"
                  variant={isCustom || isSelected ? "emphasis" : "low"}
                  onClick={() =>
                    changePriceSettings({
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
                      {isCustom && <Icon size={12} component={X} />}
                    </Flex>
                  )}
                </MicroButton>
              )
            })}
          </Flex>
        )}
      </Flex>
      <Flex justify="space-between" align="center">
        <Flex py={4} pl={4} gap={4} align="center">
          <ButtonIcon
            onClick={() =>
              viewField.onChange(
                (isOfferView
                  ? "buyPrice"
                  : "offerPrice") satisfies PlaceOrderView,
              )
            }
          >
            <AssetIcon />
          </ButtonIcon>
          <Text fw={600} fs="p3" lh={px(14)} color={getToken("text.high")}>
            {isOfferView ? buyAsset.symbol : offerAsset.symbol}
          </Text>
        </Flex>
        <NumberInput
          variant="embedded"
          value={price}
          allowNegative={false}
          onValueChange={({ value: price }, { source }) => {
            if (source === "prop") {
              return
            }

            const reversePrice = getReversePrice(price)

            const [offerPrice, buyPrice] = isOfferView
              ? [price, reversePrice]
              : [reversePrice, price]

            changePriceSettings({
              type: "fixed",
              offerPrice,
              buyPrice,
              view: viewField.value,
            })
          }}
          placeholder="0"
          sx={{
            fontWeight: 600,
            fontSize: 14,
            lineHeight: 1,
            color: getToken("text.high"),
            textAlign: "right",
          }}
        />
      </Flex>
    </Flex>
  )
}
