import { CircleOff } from "@galacticcouncil/ui/assets/icons"
import {
  Box,
  Flex,
  Icon,
  ProgressBar,
  Skeleton,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { FC } from "react"
import { useTranslation } from "react-i18next"
import { clamp } from "remeda"

import { useInitialOtcOfferAmount } from "@/modules/trade/otc/table/columns/OfferStatusColumn.utils"
import { type OtcOfferTabular } from "@/modules/trade/otc/table/OtcTable.columns"
import { scaleHuman } from "@/utils/formatting"

type Props = {
  readonly offer: OtcOfferTabular
}

export const OfferPartialyFillable: FC<Props> = ({ offer }) => {
  const { t } = useTranslation("common")
  const { data, isLoading } = useInitialOtcOfferAmount(
    offer.id,
    offer.isPartiallyFillable,
  )

  if (!offer.isPartiallyFillable) {
    return (
      <Flex justify="center">
        <Icon
          size="m"
          component={CircleOff}
          color={getToken("icons.onSurface")}
        />
      </Flex>
    )
  }

  if (isLoading) {
    return <Skeleton sx={{ height: "2xs" }} />
  }

  const currentAmount = new Big(offer.assetAmountOut || "0")
  const initialAmount = data?.amountOutInitial
    ? new Big(scaleHuman(data.amountOutInitial, offer.assetOut.decimals))
    : null

  if (!initialAmount) {
    return null
  }

  const filled = initialAmount.minus(currentAmount)
  const filledPct = clamp(
    filled.div(initialAmount).mul(100).round(1, Big.roundDown).toNumber(),
    {
      min: 0,
      max: 100,
    },
  )

  return (
    <Box mx="auto">
      <ProgressBar
        value={filledPct}
        customLabel={
          <Text fs="p6" fw={600} width="xl" whiteSpace="nowrap" align="left">
            {t("percent", { value: filledPct, maxFractionDigits: 1 })}
          </Text>
        }
      />
    </Box>
  )
}
