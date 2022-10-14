import { Separator } from "components/Separator/Separator"
import { Switch } from "components/Switch/Switch"
import { GradientText } from "components/Typography/GradientText/GradientText"
import { Heading } from "components/Typography/Heading/Heading"
import { Text } from "components/Typography/Text/Text"
import { FC } from "react"
import { useTranslation } from "react-i18next"
import {
  useTotalInFarms,
  useTotalInPools,
} from "sections/pools/header/PoolsHeader.utils"
import { useAccountStore } from "state/store"

// TODO: show switch once requested changes to total values in top section are done
const showSwitch = false

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

  const totalInPools = useTotalInPools()
  const totalInFarms = useTotalInFarms()

  return (
    <>
      <div sx={{ flex: "row", justify: "space-between", mb: 43 }}>
        <GradientText fs={30} fw={700}>
          {t("pools.header.title")}
        </GradientText>
        {showSwitch && !!account && (
          <Switch
            value={showMyPositions}
            onCheckedChange={onShowMyPositionsChange}
            size="small"
            name="my-positions"
            label={t("pools.header.switch")}
            withLabel
          />
        )}
      </div>
      <div
        sx={{ flex: ["column", "row"], mb: 40 }}
        css={{ "> *:not([role='separator'])": { flex: 1 } }}
      >
        <div sx={{ flex: ["row", "column"], justify: "space-between" }}>
          <Text color="neutralGray300" sx={{ mb: 14 }}>
            {t("pools.header.valueLocked")}
          </Text>
          <div sx={{ flex: "row", align: "baseline" }}>
            <Heading as="h3" sx={{ fontSize: [16, 42], fontWeight: 900 }}>
              {t("value.usd", { amount: totalInPools.data })}
            </Heading>
          </div>
        </div>
        <Separator sx={{ mb: 12, display: ["inherit", "none"] }} />
        <div sx={{ flex: ["row", "column"], justify: "space-between" }}>
          <Text color="neutralGray300" sx={{ mb: 14 }}>
            {t("pools.header.valueFarms")}
          </Text>
          <div sx={{ flex: "row", align: "baseline" }}>
            <Heading as="h3" sx={{ fontSize: [16, 42], fontWeight: 900 }}>
              {t("value.usd", { amount: totalInFarms.data })}
            </Heading>
          </div>
        </div>
      </div>
    </>
  )
}
