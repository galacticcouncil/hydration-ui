import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { SBond, SItem } from "./Bond.styled"
import { Icon } from "components/Icon/Icon"
import { ReactComponent as ClockIcon } from "assets/icons/ClockIcon.svg"
import { BondView } from "./Bond"
import Skeleton from "react-loading-skeleton"
import * as React from "react"
import { useMedia } from "react-use"
import { theme } from "theme"
import { Button } from "components/Button/Button"

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
        <Skeleton width={200} height={height} sx={{ mt: 3 }} />
      </div>
      <SItem>
        <div sx={{ flex: "row", align: "center", gap: 6 }}>
          <Icon icon={<ClockIcon />} sx={{ color: "brightBlue300" }} />
          <Text color="basic400" fs={14}>
            {t("bond.endingIn")}
          </Text>
        </div>
        <Skeleton width={isColumnView ? 100 : "100%"} height={height} />
      </SItem>
      <SItem>
        <Text color="basic400" fs={14}>
          {t("bond.maturity")}
        </Text>
        <Skeleton width={isColumnView ? 100 : "100%"} height={height} />
      </SItem>
      <SItem>
        <Text color="basic400" fs={14}>
          {t("bond.discount")}
        </Text>
        <Skeleton width={isColumnView ? 100 : "100%"} height={height} />
      </SItem>
      <Button
        disabled={true}
        fullWidth={true}
        sx={{ mt: view === "card" ? 12 : [12, 0] }}
      >
        Details
      </Button>
    </SBond>
  )
}
