import { Button } from "components/Button/Button"
import { Heading } from "components/Typography/Heading/Heading"
import { Text } from "components/Typography/Text/Text"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { SBond, SItem } from "./Bond.styled"
import { Icon } from "components/Icon/Icon"
import { ReactComponent as ClockIcon } from "assets/icons/ClockIcon.svg"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { SInfoIcon } from "sections/pools/pool/Pool.styled"
import { formatDate } from "utils/formatting"
import { BondView } from "./Bond"
import Skeleton from "react-loading-skeleton"
import * as React from "react"
import { useMedia } from "react-use"
import { theme } from "theme"

type Props = {
  view?: BondView
}

export const BondSkeleton = ({ view }: Props) => {
  const { t } = useTranslation()
  const isDesktop = useMedia(theme.viewport.gte.sm)
  const isCard = view === "card"

  const height = isDesktop ? (isCard ? 26 : 21) : 19

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
        <Skeleton circle={true} width="24px" height="24px" />
        <Skeleton width={200} height={height} sx={{ mt: 3 }} />
      </div>
      <SItem>
        <div sx={{ flex: "row", align: "center", gap: 6 }}>
          <Icon icon={<ClockIcon />} sx={{ color: "brightBlue300" }} />
          <Text color="basic400">{t("bond.endingIn")}</Text>
        </div>
        <Skeleton
          width={isCard ? 100 : "100%"}
          height={height}
          sx={{ mt: 3 }}
        />
      </SItem>
      <SItem>
        <Text color="basic400">{t("bond.maturity")}</Text>
        <Skeleton
          width={isCard ? 100 : "100%"}
          height={height}
          sx={{ mt: 3 }}
        />
      </SItem>
      <SItem>
        <Text color="basic400">{t("bond.discount")}</Text>
        <Skeleton
          width={isCard ? 100 : "100%"}
          height={height}
          sx={{ mt: 3 }}
        />
      </SItem>
      <Skeleton width="100%" height={40} sx={{ mt: 3 }} />
    </SBond>
  )
}
