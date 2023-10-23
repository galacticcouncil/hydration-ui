import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { SBond, SItem } from "./Bond.styled"
import { BondView } from "./Bond"
import Skeleton from "react-loading-skeleton"
import { useMedia } from "react-use"
import { theme } from "theme"
import { Button } from "components/Button/Button"
import { SSeparator } from "components/Separator/Separator.styled"

type Props = {
  view?: BondView
}

export const BondSkeleton = ({ view }: Props) => {
  const { t } = useTranslation()
  const isDesktop = useMedia(theme.viewport.gte.sm)
  const isCard = view === "card"

  const isColumnView = !isDesktop || isCard
  const height = 13

  return (
    <SBond view={view ?? "list"}>
      <div
        sx={{
          flex: "row",
          align: "center",
          gap: 16,
          mb: isCard ? 12 : [12, 0],
        }}
      >
        <Skeleton circle={true} width={24} height={24} />
        <div sx={{ flex: "column" }}>
          <Skeleton width={50} height={height + 5} sx={{ mt: 3 }} />
          <Skeleton width={150} height={height} sx={{ mt: 3 }} />
        </div>
      </div>
      <div
        sx={{ flex: ["column", "row"], justify: "space-evenly" }}
        css={{ flex: "1 0 auto" }}
      >
        <SItem>
          <div sx={{ flex: "row", align: "center", gap: 6 }}>
            <Text color="basic400" fs={14}>
              {t("bonds.endingIn")}
            </Text>
          </div>
          <Skeleton width={isColumnView ? 100 : "100%"} height={height} />
        </SItem>
        <SSeparator
          orientation="vertical"
          css={{ background: `rgba(${theme.rgbColors.white}, 0.06)` }}
        />
        <SItem>
          <Text color="basic400" fs={14}>
            {t("bonds.maturity")}
          </Text>
          <Skeleton width={isColumnView ? 100 : "100%"} height={height} />
        </SItem>
        <SSeparator
          orientation="vertical"
          css={{ background: `rgba(${theme.rgbColors.white}, 0.06)` }}
        />
        <SItem>
          <Skeleton width={isColumnView ? 100 : 60} height={height} />
          <Skeleton width={isColumnView ? 100 : 60} height={height} />
        </SItem>
      </div>

      <Button
        disabled={true}
        fullWidth={true}
        sx={{ mt: view === "card" ? 12 : [12, 0], maxWidth: ["none", 150] }}
      >
        {t("bonds.btn")}
      </Button>
    </SBond>
  )
}
