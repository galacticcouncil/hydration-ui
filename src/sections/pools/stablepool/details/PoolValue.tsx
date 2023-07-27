import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { DollarAssetValue } from "components/DollarAssetValue/DollarAssetValue"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import Skeleton from "react-loading-skeleton"
import { OmnipoolPool } from "sections/pools/PoolsPage.utils"
import { usePoolDetailsTradeVolume } from "sections/pools/pool/details/PoolDetails.utils"
import { BN_NAN } from "utils/constants"

type PoolValueProps = { pool: OmnipoolPool; className?: string }

export const PoolValue = ({ pool, className }: PoolValueProps) => {
  const { t } = useTranslation()
  const { data, isLoading } = usePoolDetailsTradeVolume(pool.id)

  return (
    <div sx={{ flex: "column", justify: "end" }} className={className}>
      <div sx={{ flex: "row", justify: "space-between" }}>
        <div sx={{ flex: "column", gap: 10 }}>
          <Text fs={13} color="basic400">
            {t("liquidity.asset.details.total")}
          </Text>
          <div sx={{ flex: "row", align: "center", gap: 8, mb: 8 }}>
            <Text lh={22} color="white" fs={18}>
              <DisplayValue value={pool.totalDisplay} />
            </Text>
          </div>
        </div>
        <div sx={{ flex: "column", gap: 10, width: ["auto", 118] }}>
          <div sx={{ flex: "row", align: "center", gap: 6 }}>
            <Text fs={13} color="basic400">
              {t("liquidity.asset.details.total.stablepool")}
            </Text>
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
