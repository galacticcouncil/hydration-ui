import { useTranslation } from "react-i18next"
import { Text } from "components/Typography/Text/Text"
import { OmnipoolPool } from "sections/pools/PoolsPage.utils"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { SInfoIcon } from "./PoolValue.styled"

type PoolValueProps = { pool: OmnipoolPool }

export const PoolValue = ({ pool }: PoolValueProps) => {
  const { t } = useTranslation()

  return (
    <div sx={{ flex: "column", width: 300, justify: "end" }}>
      <div sx={{ flex: "row", justify: "space-between" }}>
        <div sx={{ flex: "column", gap: 10 }}>
          <Text fs={13} color="basic400">
            {t("pools.pool.poolDetails.total")}
          </Text>
          <div sx={{ flex: "row", align: "center", gap: 8, mb: 8 }}>
            <Text lh={22} color="white" fs={18}>
              {t("value.usd", { amount: pool.total })}
            </Text>
          </div>
        </div>
        <div sx={{ flex: "column", gap: 10 }}>
          <div sx={{ flex: "row", align: "center", gap: 6 }}>
            <Text fs={13} color="basic400">
              {t("pools.pool.poolDetails.24hours")}
            </Text>
            <InfoTooltip text={t("pools.pool.poolDetails.24hours.tooltip")}>
              <SInfoIcon />
            </InfoTooltip>
          </div>
          <Text lh={22} color="white" tAlign={["right", "left"]}>
            {t("value.usd", { amount: pool.volume24h })}
          </Text>
        </div>
      </div>
    </div>
  )
}
