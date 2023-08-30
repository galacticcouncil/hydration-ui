import { MakeGenerics, useSearch } from "@tanstack/react-location"
import { useAssetMeta } from "api/assetMeta"
import { useBonds } from "api/bonds"
import { Text } from "components/Typography/Text/Text"
import { formatDate } from "utils/formatting"
import { ReactComponent as ClockIcon } from "assets/icons/ClockIcon.svg"
import { ReactComponent as DollarIcon } from "assets/icons/Dollar2Icon.svg"
import { Icon } from "components/Icon/Icon"
import { gradientBorder } from "theme"
import { Trans, useTranslation } from "react-i18next"
import { BondProgreesBar } from "./components/BondProgressBar/BondProgressBar"
import BN from "bignumber.js"
import { DetailCard } from "./components/DetailCard/DetailCard"

export type SearchGenerics = MakeGenerics<{
  Search: { id: number }
}>

export const BondDetailsData = () => {
  const { t } = useTranslation()
  const search = useSearch<SearchGenerics>()
  const id = search.id?.toString()

  const bonds = useBonds(id)
  const bond = bonds?.data?.[0]
  const meta = useAssetMeta(bond?.assetId)

  if (!bonds.data) return null

  const formattedMaturity = formatDate(
    new Date(bond?.maturity ?? ""),
    "yyyyMMdd",
  )

  /* Will be changed in the future */
  const cards = [
    {
      label: "Current bond price",
      value: BN(5),
      icon: <Icon sx={{ color: "basic600" }} icon={<DollarIcon />} />,
    },
    {
      label: "Current spot price",
      value: BN(15),
      icon: <Icon sx={{ color: "basic600" }} icon={<DollarIcon />} />,
    },
    {
      label: "Discount",
      value: BN(225),
      icon: <Icon sx={{ color: "basic600" }} icon={<DollarIcon />} />,
    },
    {
      label: "Maturity Date",
      value: BN(3335),
      icon: <Icon sx={{ color: "basic600" }} icon={<ClockIcon />} />,
    },
  ]

  return (
    <div sx={{ flex: "column", gap: 40 }}>
      <div sx={{ flex: "row", justify: "space-between", align: "center" }}>
        <Text
          fs={24}
          color="white"
          font="FontOver"
        >{`${meta.data?.symbol}B${formattedMaturity}`}</Text>
        <div sx={{ flex: "row", align: "center", gap: 4 }}>
          <Icon sx={{ color: "brightBlue300" }} icon={<ClockIcon />} />
          <Text fs={20} color="white" font="ChakraPetchSemiBold">
            <Trans
              t={t}
              i18nKey="bonds.details.header.end"
              tOptions={{
                date: "23H 22m",
              }}
            >
              <span sx={{ color: "brightBlue300", fontSize: 20 }} />
            </Trans>
          </Text>
        </div>
      </div>

      {/*Ignore it*/}
      <div
        sx={{
          height: 490,
          flex: "row",
          justify: "center",
          align: "center",
          bg: "basic900",
        }}
        css={{ ...gradientBorder }}
      >
        <Text font="FontOver" fs={30}>
          Palo's components
        </Text>
      </div>

      <BondProgreesBar sold={BN(42242)} total={BN(122423)} />

      <div sx={{ flex: "row", gap: 14, flexWrap: "wrap" }}>
        {cards.map((card, i) => (
          <DetailCard
            key={i}
            label={card.label}
            value={card.value.toString()}
            icon={card.icon}
          />
        ))}
      </div>
    </div>
  )
}
