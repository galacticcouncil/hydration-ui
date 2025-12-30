import { Link } from "@tanstack/react-location"
import { Icon } from "components/Icon/Icon"
import { SSeparator } from "components/Separator/Separator.styled"
import { Text } from "components/Typography/Text/Text"
import { useWarningsStore } from "components/WarningMessage/WarningMessage.utils"
import { LINKS } from "utils/navigation"

import Warning from "assets/icons/WarningIconRed.svg?react"
import CrossIcon from "assets/icons/CrossIcon.svg?react"
import { useTranslation } from "react-i18next"
import { DOT_ASSET_ID } from "utils/constants"

export const DOTLiquidityPositionsBanner = () => {
  const { t } = useTranslation()
  const {
    setWarnings,
    warnings: { dotLiquidity },
  } = useWarningsStore()

  if (!dotLiquidity.visible) return null

  return (
    <div
      sx={{
        flex: "row",
        align: "center",
        justify: "center",
        bg: "warningYellow300",
        py: [6, 2],
      }}
    >
      <div
        sx={{
          flex: ["column", "row"],
          gap: ["4px", "14px"],
          justify: "center",
          align: ["start", "center"],
          flexGrow: 1,
        }}
      >
        <div sx={{ flex: "row", gap: 4, align: "center" }}>
          <Icon size={12} icon={<Warning />} sx={{ color: "black" }} />
          <Text fs={12} color="black">
            {t("banner.dotLiquidity.label")}
          </Text>
        </div>

        <SSeparator
          orientation="vertical"
          sx={{ height: 12, display: ["none", "block"] }}
          color="black"
          opacity={0.2}
        />

        <Link to={LINKS.myLiquidity} search={{ id: DOT_ASSET_ID }}>
          <Text
            fs={11}
            color="black"
            sx={{ pl: [15, 0] }}
            css={{ textDecoration: "underline" }}
          >
            {t("banner.dotLiquidity.link")}
          </Text>
        </Link>
      </div>

      <Icon
        size={22}
        sx={{ color: "black" }}
        css={{ cursor: "pointer" }}
        onClick={(e) => {
          e.stopPropagation()
          setWarnings("dotLiquidity", false)
        }}
        icon={<Icon icon={<CrossIcon />} />}
      />
    </div>
  )
}
