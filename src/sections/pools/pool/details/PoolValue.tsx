import { useTranslation } from "react-i18next"
import { Text } from "components/Typography/Text/Text"
import { OmnipoolPool } from "sections/pools/PoolsPage.utils"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { SInfoIcon } from "./PoolValue.styled"
import { DollarAssetValue } from "components/DollarAssetValue/DollarAssetValue"
import { usePoolDetailsTradeVolume } from "sections/pools/pool/details/PoolDetails.utils"
import { BN_NAN } from "utils/constants"
import Skeleton from "react-loading-skeleton"

type PoolValueProps = { pool: OmnipoolPool }

export const PoolValue = ({ pool }: PoolValueProps) => {
  const { t } = useTranslation()

  const { data, isLoading } = usePoolDetailsTradeVolume(pool.id)

  return (
    <div sx={{ flex: "column", width: ["auto", 300], justify: "end" }}>
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
          {isLoading ? (
            <Skeleton />
          ) : (
            <DollarAssetValue
              value={data ?? BN_NAN}
              wrapper={(children) => (
                <Text lh={22} color="white" tAlign={["right", "left"]}>
                  {children}
                </Text>
              )}
            >
              {t("value.usd", { amount: data })}
            </DollarAssetValue>
          )}
        </div>
      </div>
    </div>
  )
}
