import { AssetIcon } from "@galacticcouncil/ui/assets/icons"
import {
  ButtonIcon,
  Flex,
  NumberInput,
  Text,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken, px } from "@galacticcouncil/ui/utils"
import { getReversePrice } from "@galacticcouncil/utils"
import { FC } from "react"
import { useController, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import {
  PlaceOrderFormValues,
  PlaceOrderView,
  PriceSettings,
} from "@/modules/trade/otc/place-order/PlaceOrderModalContent.form"
import { PlaceOrderPriceButtons } from "@/modules/trade/otc/place-order/PlaceOrderPriceButtons"
import { TAsset } from "@/providers/assetsProvider"

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
  const { isMobile } = useBreakpoints()
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
        {!isMobile && (
          <PlaceOrderPriceButtons
            isOfferView={isOfferView}
            price={price}
            priceGain={priceGain}
            isPriceLoaded={isPriceLoaded}
            onChange={changePriceSettings}
          />
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
      {isMobile && (
        <Flex justify="end">
          <PlaceOrderPriceButtons
            isOfferView={isOfferView}
            price={price}
            priceGain={priceGain}
            isPriceLoaded={isPriceLoaded}
            onChange={changePriceSettings}
          />
        </Flex>
      )}
    </Flex>
  )
}
