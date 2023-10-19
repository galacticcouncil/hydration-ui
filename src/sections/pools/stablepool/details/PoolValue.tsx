import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { DollarAssetValue } from "components/DollarAssetValue/DollarAssetValue"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import Skeleton from "react-loading-skeleton"
import { usePoolDetailsTradeVolume } from "sections/pools/pool/details/PoolDetails.utils"
import { BN_NAN } from "utils/constants"
import { SInfoIcon } from "sections/pools/pool/Pool.styled"
import { Stablepool } from "sections/pools/PoolsPage.utils"

type PoolValueProps = {
  pool: Stablepool
  className?: string
}

export const PoolValue = ({ pool, className }: PoolValueProps) => {
  const { t } = useTranslation()

  const { data, isLoading } = usePoolDetailsTradeVolume(pool.id)

  const { total, totalDisplay } = pool

  const percentInOmnipool = total.value
    .dividedBy(totalDisplay)
    .multipliedBy(100)

  return (
    <div sx={{ flex: "column", justify: "end" }} className={className}>
      <div sx={{ flex: "row", justify: "space-between" }}>
        <div sx={{ flex: "column", gap: 10 }}>
          <Text fs={13} color="basic400">
            {t("liquidity.stablepool.asset.details.total")}
          </Text>
          <div
            sx={{
              flex: "column",
              align: "start",
              justify: "center",
              gap: 4,
            }}
          >
            <Text lh={22} color="white" fs={18}>
              <DisplayValue value={total.value} />
            </Text>
            <Text fs={13} color="basic500">
              {t("liquidity.asset.details.percent", {
                value: percentInOmnipool,
              })}
            </Text>
          </div>
        </div>
        <div sx={{ flex: "column", gap: 10, width: ["auto", 118] }}>
          <div sx={{ flex: "row", align: "center", gap: 6 }}>
            <Text fs={13} color="basic400">
              {t("liquidity.asset.details.24hours")}
            </Text>
            <InfoTooltip text={t("liquidity.asset.details.24hours.tooltip")}>
              <SInfoIcon />
            </InfoTooltip>
          </div>
          {isLoading ? (
            <Skeleton />
          ) : (
            <DollarAssetValue
              value={data ?? BN_NAN}
              wrapper={(children) => (
                <Text fs={18} lh={22} color="white" tAlign={["right", "left"]}>
                  {children}
                </Text>
              )}
            >
              <DisplayValue value={data} />
            </DollarAssetValue>
          )}
        </div>
      </div>
    </div>
  )
}
