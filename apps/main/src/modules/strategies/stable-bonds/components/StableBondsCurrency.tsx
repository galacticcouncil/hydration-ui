import {
  Flex,
  ProgressBar,
  Skeleton,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { SCurrencyItem } from "@/modules/strategies/stable-bonds/components/StableBondsCurrency.styled"
import { useInitialOtcOfferAmount } from "@/modules/trade/otc/table/columns/OfferStatusColumn.utils"
import { OtcOffer } from "@/modules/trade/otc/table/OtcTable.query"
import { scaleHuman } from "@/utils/formatting"

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

  const initialAmount = data?.amountInInitial
    ? Big(scaleHuman(data.amountInInitial, asset.decimals))
    : null

  const remainingPct =
    initialAmount && !initialAmount.eq(0)
      ? Big(amount).div(initialAmount).mul(100).toNumber()
      : 0

  return (
    <SCurrencyItem gap="xs">
      <Flex align="center" gap="base">
        <AssetLogo id={asset.id} size="small" />
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
      {isFillable &&
        (isLoading ? (
          <Skeleton sx={{ height: "2xs" }} />
        ) : (
          remainingPct > 0 && (
            <ProgressBar
              value={remainingPct}
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
          )
        ))}
    </SCurrencyItem>
  )
}
