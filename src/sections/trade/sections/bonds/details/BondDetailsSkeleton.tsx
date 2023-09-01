import { Text } from "components/Typography/Text/Text"
import { BondDetailsHeader } from "./BondDetailsData"
import { BondProgreesBar } from "./components/BondProgressBar/BondProgressBar"
import { gradientBorder } from "theme"
import { Skeleton } from "sections/trade/sections/bonds/table/skeleton/Skeleton"
import { useTranslation } from "react-i18next"

export const BondDetailsSkeleton = () => {
  const { t } = useTranslation()

  const tableProps = {
    title: t("bonds.table.title"),
  }

  return (
    <div sx={{ flex: "column", gap: 40 }}>
      <BondDetailsHeader title="" bondId="" loading />

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

      <BondProgreesBar />

      <Skeleton {...tableProps} />
    </div>
  )
}
