import { Separator } from "components/Separator/Separator"
import { Switch } from "components/Switch/Switch"
import { Heading } from "components/Typography/Heading/Heading"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { useMedia } from "react-use"
import { PoolsHeaderTotal } from "sections/pools/header/PoolsHeaderTotal"
import { useAccountStore } from "state/store"
import { theme } from "theme"
import { PoolsHeaderVolume } from "./PoolsHeaderVolume"

type Props = {
  myPositions: boolean
  onMyPositionsChange: (value: boolean) => void
  disableMyPositions: boolean
}

const enabledFarms = import.meta.env.VITE_FF_FARMS_ENABLED === "true"

export const PoolsHeader = ({
  myPositions,
  onMyPositionsChange,
  disableMyPositions,
}: Props) => {
  const { t } = useTranslation()

  const isDesktop = useMedia(theme.viewport.gte.sm)

  const { account } = useAccountStore()

  return (
    <>
      <div sx={{ flex: "row", justify: "space-between", mb: 43 }}>
        <Heading fs={20} lh={26} fw={500}>
          {t("liquidity.header.title")}
        </Heading>
        {!!account && (
          <Switch
            value={myPositions}
            onCheckedChange={onMyPositionsChange}
            disabled={disableMyPositions}
            size="small"
            name="my-positions"
            label={t("liquidity.header.switch")}
          />
        )}
      </div>
      <div
        sx={{
          flex: ["column", "row"],
          mb: 40,
          flexWrap: "wrap",
          gap: [12, 35],
          align: ["normal", "center"],
        }}
        css={{ "> *:not([role='separator'])": { flex: 1 } }}
      >
        <div sx={{ flex: ["row", "column"], justify: "space-between" }}>
          <Text color="brightBlue300" sx={{ mb: 14 }}>
            {t("liquidity.header.totalLocked")}
          </Text>
          <div sx={{ flex: "row", align: "baseline" }}>
            <PoolsHeaderTotal variant="pools" myPositions={myPositions} />
          </div>
        </div>
        <Separator
          sx={{
            mb: [15, 0],
            height: ["1px", "40px"],
          }}
          css={{ background: `rgba(${theme.rgbColors.white}, 0.12)` }}
          orientation={isDesktop ? "vertical" : "horizontal"}
        />
        {enabledFarms && (
          <>
            <div sx={{ flex: ["row", "column"], justify: "space-between" }}>
              <Text color="brightBlue300" sx={{ mb: 14 }}>
                {t("liquidity.header.totalInFarms")}
              </Text>
              <div sx={{ flex: "row", align: "baseline" }}>
                <PoolsHeaderTotal variant="farms" myPositions={myPositions} />
              </div>
            </div>
            <Separator
              sx={{
                mb: [15, 0],
                height: ["1px", "40px"],
              }}
              css={{ background: `rgba(${theme.rgbColors.white}, 0.12)` }}
              orientation={isDesktop ? "vertical" : "horizontal"}
            />
          </>
        )}
        <div sx={{ flex: ["row", "column"], justify: "space-between" }}>
          <Text color="brightBlue300" sx={{ mb: 14 }}>
            {t("liquidity.header.24hours")}
          </Text>
          <div sx={{ flex: "row", align: "baseline" }}>
            <PoolsHeaderVolume myPositions={myPositions} variant="pools" />
          </div>
        </div>
      </div>
    </>
  )
}
