import { Alert, Checkbox, Flex, Label } from "@galacticcouncil/ui/components"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { FC } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { PlaceOrderFormValues } from "@/modules/trade/otc/place-order/PlaceOrderModalContent.form"
import { TAsset } from "@/providers/assetsProvider"

type Props = {
  readonly offerAsset: TAsset
  readonly buyAsset: TAsset
  readonly isConfirmed: boolean
}

export const PriceGainWarning: FC<Props> = ({
  offerAsset,
  buyAsset,
  isConfirmed,
}) => {
  const { t } = useTranslation(["common", "trade"])

  const { watch, setValue } = useFormContext<PlaceOrderFormValues>()

  const [priceGain, isPriceSwitched] = watch(["priceGain", "isPriceSwitched"])

  const buyPriceGain = isPriceSwitched
    ? priceGain
    : Big(priceGain).times(-1).toString()

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
            percentage: t("percent", { value: buyPriceGain }),
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
          checked={isConfirmed}
          onCheckedChange={(isConfirmed: boolean) =>
            setValue("priceGainConfirmation.confirmed", isConfirmed)
          }
        />
        {t("trade:otc.placeOrder.priceGainWarning.confirmation")}
      </Label>
    </Flex>
  )
}
