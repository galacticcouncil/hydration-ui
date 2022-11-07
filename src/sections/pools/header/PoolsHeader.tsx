import { Switch } from "components/Switch/Switch"
import { GradientText } from "components/Typography/GradientText/GradientText"
import { FC } from "react"
import { useTranslation } from "react-i18next"
import { useAccountStore } from "state/store"
import { Text } from "components/Typography/Text/Text"
import { Separator } from "components/Separator/Separator"
import { PoolsHeaderTotal } from "sections/pools/header/PoolsHeaderTotal"

type Props = {
  showMyPositions: boolean
  onShowMyPositionsChange: (value: boolean) => void
}

export const PoolsHeader: FC<Props> = ({
  showMyPositions,
  onShowMyPositionsChange,
}) => {
  const { t } = useTranslation()

  const { account } = useAccountStore()

  return (
    <>
      <div sx={{ flex: "row", justify: "space-between", mb: 43 }}>
        <GradientText fs={30} fw={700}>
          {t("pools.header.title")}
        </GradientText>
        {!!account && (
          <Switch
            value={showMyPositions}
            onCheckedChange={onShowMyPositionsChange}
            size="small"
            name="my-positions"
            label={t("pools.header.switch")}
          />
        )}
      </div>
      <div
        sx={{ flex: ["column", "row"], mb: 40 }}
        css={{ "> *:not([role='separator'])": { flex: 1 } }}
      >
        <div sx={{ flex: ["row", "column"], justify: "space-between" }}>
          <Text color="neutralGray300" sx={{ mb: 14 }}>
            {t("pools.header.totalLocked")}
          </Text>
          <div sx={{ flex: "row", align: "baseline" }}>
            <PoolsHeaderTotal variant="pools" myPositions={showMyPositions} />
          </div>
        </div>
        <Separator sx={{ mb: 12, display: ["inherit", "none"] }} />
        <div sx={{ flex: ["row", "column"], justify: "space-between" }}>
          <Text color="neutralGray300" sx={{ mb: 14 }}>
            {t("pools.header.totalFarms")}
          </Text>
          <div sx={{ flex: "row", align: "baseline" }}>
            <PoolsHeaderTotal variant="farms" myPositions={showMyPositions} />
          </div>
        </div>
      </div>
    </>
  )
}
