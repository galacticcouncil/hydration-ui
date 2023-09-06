import { Icon } from "components/Icon/Icon"
import { DetailCard } from "sections/trade/sections/bonds/details/components/DetailCard/DetailCard"
import { ReactComponent as ClockIcon } from "assets/icons/ClockIcon.svg"
import { ReactComponent as DollarIcon } from "assets/icons/Dollar2Icon.svg"
import { ReactComponent as PercentageIcon } from "assets/icons/Percentage.svg"
import { ReactComponent as GraphIcon } from "assets/icons/Graph.svg"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { useDisplayPrice } from "utils/displayAsset"
import { BN_1 } from "utils/constants"
import { useTranslation } from "react-i18next"

export const BondInfoCards = ({
  assetId,
  bondId,
  maturity,
}: {
  assetId: string
  bondId: string
  maturity: string
}) => {
  const { t } = useTranslation()
  const spotPrice = useDisplayPrice(assetId)
  const spotPriceBond = useDisplayPrice(bondId)

  const currentSpotPrice = spotPrice.data?.spotPrice ?? BN_1
  const currentBondPrice = spotPriceBond.data?.spotPrice ?? BN_1

  const isDiscount = currentSpotPrice.gt(currentBondPrice)

  const discount = isDiscount
    ? currentSpotPrice
        .minus(currentBondPrice)
        .div(currentSpotPrice)
        .multipliedBy(100)
    : currentBondPrice
        .minus(currentSpotPrice)
        .div(currentBondPrice)
        .multipliedBy(100)

  const cards = [
    {
      label: t("bonds.details.card.bondPrice"),
      value: <DisplayValue value={currentBondPrice} type="token" />,
      icon: <Icon sx={{ color: "basic600" }} icon={<GraphIcon />} />,
    },
    {
      label: t("bonds.details.card.spotPrice"),
      value: <DisplayValue value={currentSpotPrice} />,
      icon: <Icon sx={{ color: "basic600" }} icon={<DollarIcon />} />,
    },
    {
      label: isDiscount ? t("bond.discount") : t("bond.premium"),
      value: t("value.percentage", { value: discount.toString() }),
      icon: <Icon sx={{ color: "basic600" }} icon={<PercentageIcon />} />,
    },
    {
      label: t("bonds.details.card.maturity"),
      value: maturity,
      icon: <Icon sx={{ color: "basic600" }} icon={<ClockIcon />} />,
    },
  ]

  return (
    <div sx={{ flex: ["column", "row"], gap: 14, flexWrap: "wrap" }}>
      {cards.map((card, i) => (
        <DetailCard
          key={i}
          label={card.label}
          value={card.value}
          icon={card.icon}
        />
      ))}
    </div>
  )
}
