import { Alert, Flex, Text, Toggle } from "@galacticcouncil/ui/components"
import Big from "big.js"
import { FC } from "react"
import { useController, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import {
  PlaceOrderFormValues,
  PlaceOrderView,
} from "@/modules/trade/otc/place-order/PlaceOrderModalContent.form"
import { TAsset } from "@/providers/assetsProvider"

type Props = {
  readonly offerAsset: TAsset
  readonly buyAsset: TAsset
  readonly priceGain: string
  readonly view: PlaceOrderView
}

export const PriceGainWarning: FC<Props> = ({
  offerAsset,
  buyAsset,
  priceGain,
  view,
}) => {
  const { t } = useTranslation(["common", "trade"])
  const { control } = useFormContext<PlaceOrderFormValues>()

  const { field: priceConfirmationField } = useController({
    control,
    name: "priceConfirmation",
  })

  if (!priceConfirmationField.value) {
    return
  }

  const isOfferView = view === "offerPrice"

  return (
    <Flex pt="m" pb="l" px="xxl" direction="column" align="center" gap="l">
      <Alert
        variant="error"
        description={t(
          `trade:otc.placeOrder.priceGainWarning.${isOfferView ? "offer" : "buy"}`,
          {
            asset: isOfferView ? offerAsset.symbol : buyAsset.symbol,
            percentage: t("percent", { value: Big(priceGain).abs() }),
          },
        )}
        action={
          <Flex align="center" as="label" gap="base">
            <Toggle
              size="large"
              checked={priceConfirmationField.value.confirmed}
              onCheckedChange={(confirmed) =>
                priceConfirmationField.onChange({ confirmed })
              }
            />
            <Text fs="p4" lh={1.3} fw={600}>
              {t("trade:otc.placeOrder.priceGainWarning.confirmation")}
            </Text>
          </Flex>
        }
      />
    </Flex>
  )
}
