import {
  Box,
  Flex,
  ProgressBar,
  Skeleton,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { useInitialOtcOfferAmount } from "@/modules/trade/otc/table/columns/OfferStatusColumn.utils"
import { OtcOffer } from "@/modules/trade/otc/table/OtcTable.query"
import { scaleHuman } from "@/utils/formatting"

const DEFAULT_INITIAL_AMOUNT = 222_222

type StableBondsCurrencyProps = {
  order: OtcOffer
}

export const StableBondsCurrency: React.FC<StableBondsCurrencyProps> = ({
  order,
}) => {
  const { assetIn: asset, assetAmountIn: amount } = order
  const { t } = useTranslation(["common", "strategies"])
  const { data, isLoading } = useInitialOtcOfferAmount(
    order.id,
    order.isPartiallyFillable,
  )

  const isFillable = Big(amount).gt(0)

  const initialAmount =
    data &&
    data.assetInId === order.assetIn.id &&
    data.assetOutId === order.assetOut.id
      ? Big(scaleHuman(data.amountInInitial, asset.decimals))
      : Big(DEFAULT_INITIAL_AMOUNT)

  const remainingPct =
    initialAmount && !initialAmount.eq(0)
      ? Big(amount).div(initialAmount).mul(100).toNumber()
      : 0

  const renderProgress = () => {
    if (!isFillable) return null
    if (isLoading) return <Skeleton sx={{ height: "2xs" }} />
    if (remainingPct <= 0) return null

    return (
      <Box asChild minWidth="8rem">
        <ProgressBar
          value={remainingPct}
          size="small"
          customLabel={
            <Text
              fs="p4"
              as="span"
              fw={600}
              color={getToken("text.tint.quart")}
            >
              {t("percent", { value: remainingPct })}
            </Text>
          }
        />
      </Box>
    )
  }

  return (
    <Flex direction="column">
      <Flex align="center" gap="base">
        <AssetLogo id={asset.id} size="medium" hideChain />
        <Text
          font="primary"
          fs="h6"
          fw={600}
          decoration={isFillable ? "none" : "line-through"}
          color={isFillable ? getToken("text.high") : getToken("text.low")}
        >
          {isFillable
            ? t("number", { value: amount })
            : t("strategies:bonds.soldOut")}
        </Text>
      </Flex>
      {renderProgress()}
    </Flex>
  )
}
