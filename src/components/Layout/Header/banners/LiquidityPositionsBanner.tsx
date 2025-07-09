import { useAccountPositions } from "api/deposits"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { useWarningsStore } from "components/WarningMessage/WarningMessage.utils"
import { useEffect } from "react"
import Warning from "assets/icons/WarningIconRed.svg?react"
import CrossIcon from "assets/icons/CrossIcon.svg?react"
import { useTranslation } from "react-i18next"
import { SSeparator } from "components/Separator/Separator.styled"
import { Link } from "components/Link/Link"
import { LINKS } from "utils/navigation"

const INVALID_ASSETS = ["13", "28"]

export const LiquidityPositionsBanner = () => {
  const { t } = useTranslation()
  const {
    setWarnings,
    warnings: { invalidPositions },
  } = useWarningsStore()

  if (!invalidPositions.visible) return null

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
            {t("banner.invalidPositions.label")}
          </Text>
        </div>

        <SSeparator
          orientation="vertical"
          sx={{ height: 12, display: ["none", "block"] }}
          color="black"
          opacity={0.2}
        />

        <Link to={LINKS.myLiquidity}>
          <Text
            fs={11}
            color="black"
            sx={{ pl: [15, 0] }}
            css={{ textDecoration: "underline" }}
          >
            {t("banner.invalidPositions.link")}
          </Text>
        </Link>
      </div>

      <Icon
        size={22}
        sx={{ color: "black" }}
        css={{ cursor: "pointer" }}
        onClick={(e) => {
          e.stopPropagation()
          setWarnings("invalidPositions", false)
        }}
        icon={<Icon icon={<CrossIcon />} />}
      />
    </div>
  )
}

export const LiquidityPositionsBannerWrapper = () => {
  const { setWarnings } = useWarningsStore()

  const { data: accountPositions, isSuccess } = useAccountPositions()
  const { omnipoolDeposits = [], liquidityPositions = [] } =
    accountPositions ?? {}

  const hasInvalidPositions =
    omnipoolDeposits.some((position) =>
      INVALID_ASSETS.includes(position.data.ammPoolId),
    ) ||
    liquidityPositions.some((position) =>
      INVALID_ASSETS.includes(position.assetId),
    )

  useEffect(() => {
    if (isSuccess) {
      if (hasInvalidPositions) {
        setWarnings("invalidPositions", true)
      } else {
        setWarnings("invalidPositions", false)
      }
    }
  }, [isSuccess, hasInvalidPositions, setWarnings])

  return null
}
