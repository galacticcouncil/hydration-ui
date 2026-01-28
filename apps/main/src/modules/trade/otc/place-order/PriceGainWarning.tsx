import { Alert, Checkbox, Flex, Label } from "@galacticcouncil/ui/components"
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
      />
      <Label
        sx={{
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "base",
        }}
      >
        <Checkbox
          checked={priceConfirmationField.value.confirmed}
          onCheckedChange={(confirmed) =>
            priceConfirmationField.onChange({ confirmed })
          }
        />
        {t("trade:otc.placeOrder.priceGainWarning.confirmation")}
      </Label>
    </Flex>
  )
}
