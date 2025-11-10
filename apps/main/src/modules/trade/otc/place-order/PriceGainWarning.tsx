import { Alert, Checkbox, Flex, Label } from "@galacticcouncil/ui/components"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useController, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { PlaceOrderFormValues } from "@/modules/trade/otc/place-order/PlaceOrderModalContent.form"
import { TAsset } from "@/providers/assetsProvider"

type Props = {
  readonly offerAsset: TAsset
  readonly buyAsset: TAsset
  readonly priceGain: string
  readonly isPriceSwitched: boolean
}

export const PriceGainWarning: FC<Props> = ({
  offerAsset,
  buyAsset,
  priceGain,
  isPriceSwitched,
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

  return (
    <Flex
      pt={getTokenPx("scales.paddings.m")}
      pb={getTokenPx("scales.paddings.l")}
      px={getTokenPx("containers.paddings.primary")}
      direction="column"
      align="center"
      gap={getTokenPx("scales.paddings.l")}
    >
      <Alert
        variant="error"
        description={t(
          `trade:otc.placeOrder.priceGainWarning.${isPriceSwitched ? "buy" : "sell"}`,
          {
            asset: isPriceSwitched ? buyAsset.symbol : offerAsset.symbol,
            percentage: t("percent", { value: priceGain }),
          },
        )}
      />
      <Label
        sx={{
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 10,
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
