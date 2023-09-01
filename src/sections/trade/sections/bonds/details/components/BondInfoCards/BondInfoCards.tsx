import { Icon } from "components/Icon/Icon"
import { DetailCard } from "sections/trade/sections/bonds/details/components/DetailCard/DetailCard"
import BN from "bignumber.js"
import { ReactComponent as ClockIcon } from "assets/icons/ClockIcon.svg"
import { ReactComponent as DollarIcon } from "assets/icons/Dollar2Icon.svg"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { useDisplayPrice } from "utils/displayAsset"

export const BondInfoCards = ({
  assetId,
  maturity,
}: {
  assetId: string
  maturity: string
}) => {
  const spotPrice = useDisplayPrice(assetId)

  const currentSpotPrice = spotPrice.data?.spotPrice.toString()
  //TODO: missing discount and currentbod prics
  const cards = [
    {
      label: "Current bond price",
      value: <DisplayValue value={BN(5)} />,
      icon: <Icon sx={{ color: "basic600" }} icon={<DollarIcon />} />,
    },
    {
      label: "Current spot price",
      value: <DisplayValue value={BN(currentSpotPrice ?? 0)} />,
      icon: <Icon sx={{ color: "basic600" }} icon={<DollarIcon />} />,
    },
    {
      label: "Discount",
      value: BN(225).toString(),
      icon: <Icon sx={{ color: "basic600" }} icon={<DollarIcon />} />,
    },
    {
      label: "Maturity Date",
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
